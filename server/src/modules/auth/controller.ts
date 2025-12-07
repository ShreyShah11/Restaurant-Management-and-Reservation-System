import { z } from 'zod';
import { Request, Response } from 'express';
import generateOTP from '@/utils/generateOTP';
import { redisClient } from '@/db/connectRedis';
import config from '@/config/env';
import { transporter } from '@/config/nodemailer';
import logger from '@/utils/logger';
import { OTP_REGEX, PASSWORD_REGEX } from '@/constants/regex';
import User from '@/models/user';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { resetPasswordVerifyTemplate, verifyEmailTemplate } from '@/utils/emailTemplates';
import { packUserData } from '@/utils/packUserData';
import axios from 'axios';
import { getProf } from '@/utils/getProf';

async function geocode(query: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Resturant Management System - (contact:devtrivedi@duck.com)',
            Referer: 'https://reservebeta.vercel.app',
        },
    });

    console.log(data);
    return data;
}

const controller = {
    sendOTPForVerification: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.email(),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email address',
                    errors: z.treeifyError(result.error),
                });
            }

            const { email } = result.data;

            const existingUser = await User.findOne({
                email,
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists',
                });
            }

            const OTP = generateOTP();

            const save = {
                OTP,
                expiry: Date.now() + 5 * 60 * 1000,
                isVerified: false,
            };

            await redisClient.set(`upcomingEmail:${email}`, JSON.stringify(save), {
                expiration: {
                    type: 'EX',
                    value: 60 * 60,
                },
            });

            const payload = {
                to: email,
                from: config.SENDER_EMAIL,
                subject: 'Your OTP Verification Code',
                html: verifyEmailTemplate(OTP),
            };

            await transporter.sendMail(payload);

            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
            });
        } catch (error) {
            logger.error('Error sending OTP:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP',
            });
        }
    },

    verifyOTPForVerification: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.email(),
                OTP: z.string().regex(OTP_REGEX),
            });

            const result = schema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid request body',
                    errors: z.treeifyError(result.error),
                });
            }

            const { email, OTP } = result.data;

            const key = await redisClient.get(`upcomingEmail:${email}`);
            if (!key) {
                return res.status(404).json({
                    success: false,
                    message: 'OTP not found or already used',
                });
            }

            const { OTP: genOTP, expiry, isVerified } = JSON.parse(key);

            if (isVerified) {
                return res.status(200).json({
                    success: true,
                    message: 'Email already verified',
                });
            }

            if (OTP !== genOTP) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid OTP',
                });
            }

            if (Date.now() > expiry) {
                return res.status(400).json({
                    success: false,
                    message: 'OTP has expired',
                });
            }

            await redisClient.set(
                `upcomingEmail:${email}`,
                JSON.stringify({
                    OTP: 'NOT_VALID',
                    expiry: 0,
                    isVerified: true,
                }),
                {
                    EX: 60 * 60,
                },
            );

            return res.status(200).json({
                success: true,
                message: 'Email successfully verified',
            });
        } catch (err) {
            logger.error('verifyOTPForVerification error:', err);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    },

    createAccount: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.email(),
                firstName: z.string().min(1, 'First name is required'),
                lastName: z.string().min(1, 'Last name is required'),
                password: z.string().regex(PASSWORD_REGEX, 'Invalid password format'),
                role: z.enum(['owner', 'customer']),
                cityName: z.string().min(2).trim(),
            });

            const result = schema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input',
                    details: z.treeifyError(result.error),
                });
            }

            const { email, firstName, lastName, password, role } = result.data;
            let cityName = result.data.cityName.trim();
            cityName = cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();
            const geoInfo = await geocode(cityName);
            const coordinates = [geoInfo[0].lon, geoInfo[0].lat];

            const key = await redisClient.get(`upcomingEmail:${email}`);
            if (!key) {
                return res.status(400).json({
                    success: false,
                    message: 'Email not found or expired. Please verify again.',
                });
            }

            const { isVerified } = JSON.parse(key);
            if (!isVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is not verified',
                });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User already exists with this email',
                });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = await User.create({
                firstName,
                lastName,
                hashedPassword,
                role,
                email,
                cityName,
                location: {
                    type: 'Point',
                    coordinates,
                },
            });

            await user.save();

            await redisClient.del(`upcomingEmail:${email}`);

            return res.status(201).json({
                success: true,
                message: 'Account created successfully',
            });
        } catch (error) {
            console.error('Error creating account:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.email(),
                password: z.string().regex(PASSWORD_REGEX, 'Invalid password format'),
            });

            const result = schema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input',
                    error: z.treeifyError(result.error),
                });
            }

            const { email, password } = result.data;

            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                });
            }

            const match = await bcrypt.compare(password, existingUser.hashedPassword);
            if (!match) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                });
            }

            const token = jwt.sign(
                {
                    userID: existingUser._id,
                    role: existingUser.role,
                },
                config.JWT_KEY,
                {
                    expiresIn: '7d',
                },
            );

            const cookieOptions: {
                httpOnly: boolean;
                secure: boolean;
                sameSite: 'strict' | 'lax' | 'none';
                maxAge: number;
                path: string;
                domain?: string;
            } = {
                httpOnly: true,
                secure: config.isProduction,
                sameSite: config.isProduction ? 'none' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            };

            res.cookie('token', token, cookieOptions);
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                token: token,
                data: packUserData(existingUser),
            });
        } catch {
            return res.status(500).json({
                success: false,
                message: 'Server error',
            });
        }
    },

    logout: async (req: Request, res: Response): Promise<Response> => {
        try {
            const token = req.cookies?.token as string | undefined;

            if (!token) {
                return res.status(200).json({
                    success: true,
                    message: 'You have been logged out successfully.',
                });
            }

            const payload = jwt.decode(token) as JwtPayload | null;

            if (!payload || typeof payload.exp !== 'number') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired authentication token.',
                });
            }

            await redisClient.set(`token:${token}`, 'BLOCKED');
            await redisClient.expireAt(`token:${token}`, payload.exp);

            res.clearCookie('token', {
                httpOnly: true,
                secure: config.isProduction,
                sameSite: 'strict',
                path: '/',
            });

            return res.status(200).json({
                success: true,
                message: 'You have been logged out successfully.',
            });
        } catch (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                success: false,
                message: 'An unexpected server error occurred. Please try again later.',
            });
        }
    },

    sendOTP_resetPassword: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.email(),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid request body',
                    errors: z.treeifyError(result.error),
                });
            }

            const { email } = result.data;

            const existingUser = await User.findOne({
                email,
            });

            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User with this email does not exist',
                });
            }

            const OTP = generateOTP();
            const save = {
                OTP,
                expiry: Date.now() + 5 * 60 * 1000,
                email: email,
                isVerified: false,
            };

            await redisClient.set(`resetPasswordOTP:${email}`, JSON.stringify(save), {
                expiration: {
                    type: 'EX',
                    value: 60 * 60,
                },
            });

            const payload = {
                to: email,
                from: config.SENDER_EMAIL,
                subject: 'Your OTP for Password Reset',
                html: resetPasswordVerifyTemplate(OTP),
            };

            await transporter.sendMail(payload);

            return res.status(200).json({
                success: true,
                message: 'OTP for password reset sent successfully',
            });
        } catch (error) {
            logger.error('Error in sendOTP_resetPassword', error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    },

    verifyOTP_resetPassword: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.email(),
                OTP: z.string().regex(OTP_REGEX),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid request body',
                    errors: z.treeifyError(result.error),
                });
            }

            const { email, OTP } = result.data;

            const key = await redisClient.get(`resetPasswordOTP:${email}`);

            if (!key) {
                return res.status(404).json({
                    success: false,
                    message: 'OTP not found or already used',
                });
            }

            const parsedData = JSON.parse(key);

            if (OTP !== parsedData.OTP) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid OTP',
                });
            }

            if (Date.now() > parsedData.expiry) {
                return res.status(400).json({
                    success: false,
                    message: 'OTP has expired',
                });
            }

            parsedData.isVerified = true;
            parsedData.OTP = 'NOT_VALID';
            parsedData.expiry = 0;

            await redisClient.set(`resetPasswordOTP:${email}`, JSON.stringify(parsedData), {
                EX: 60 * 15,
            });

            return res.status(200).json({
                success: true,
                message: 'OTP verified successfully',
            });
        } catch (error) {
            logger.error('Error in verifyOTP_resetPassword', error);

            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    },

    changePassword_resetPassword: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.email(),
                newPassword: z.string().regex(PASSWORD_REGEX, 'Invalid password format'),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid request body',
                    errors: z.treeifyError(result.error),
                });
            }

            const { email, newPassword } = result.data;

            const key = await redisClient.get(`resetPasswordOTP:${email}`);

            if (!key) {
                return res.status(400).json({
                    success: false,
                    message: 'OTP not found or expired. Please request a new OTP.',
                });
            }

            const parsedData = JSON.parse(key);

            if (!parsedData.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email not verified for password reset.',
                });
            }

            const existingUser = await User.findOne({ email });

            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.',
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 12);
            existingUser.hashedPassword = hashedPassword;

            await existingUser.save();

            await redisClient.del(`resetPasswordOTP:${email}`);

            return res.status(200).json({
                success: true,
                message: 'Password has been reset successfully.',
            });
        } catch (error) {
            logger.error('Error in changePassword_resetPassword', error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    },

    isAuthenticated: async (req: Request, res: Response) => {
        try {
            const userID = res.locals.userID! as string;
            const existingUser = await User.findById(userID);

            if (!existingUser) {
                // NOTE: never the case
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            const token = req.cookies.token! as string;

            return res.status(200).json({
                success: true,
                message: 'User is authenticated',
                token: token,
                data: {
                    user: packUserData(existingUser),
                },
            });
        } catch (error) {
            logger.error('Error in isAuthenticated', error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    },

    getMyProfile: async (req: Request, res: Response) => {
        try {
            const userID = res.locals.userID as string;

            const user = await User.findById(userID);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Profile loaded successfully',
                data: getProf(user),
            });
        } catch (error) {
            console.error('Error in getMyProfile:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    },

    updateProfile: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                firstName: z.string().min(1).optional(),
                lastName: z.string().min(1).optional(),
                // email: z.email().optional(),
                cityName: z.string().min(2).optional(),
            });

            const result = schema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input',
                    errors: z.treeifyError(result.error),
                });
            }

            const userID = res.locals.userID!;

            const existingUser = await User.findById(userID);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            const { firstName, lastName, cityName } = result.data;

            if (firstName !== undefined) {
                existingUser.firstName = firstName;
            }

            if (lastName !== undefined) {
                existingUser.lastName = lastName;
            }

            if (cityName !== undefined) {
                const trimmedCityName = cityName.trim();
                const formattedCityName =
                    trimmedCityName.charAt(0).toUpperCase() +
                    trimmedCityName.slice(1).toLowerCase();
                const geoInfo = await geocode(formattedCityName);
                const coordinates = [geoInfo[0].lon, geoInfo[0].lat];

                existingUser.cityName = formattedCityName;
                existingUser.location = {
                    type: 'Point',
                    coordinates,
                };
            }

            await existingUser.save();

            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: getProf(existingUser),
            });
        } catch (error) {
            console.error('Error in updateProfile:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    },
};

export default controller;
