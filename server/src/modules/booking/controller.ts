import { Request, Response } from 'express';
import { getIO } from '@/config/socket';
import { z } from 'zod';
import Booking, { IBooking } from '@/models/booking';
import User from '@/models/user';
import Restaurant from '@/models/restaurant';
import logger from '@/utils/logger';
import { transporter } from '@/config/nodemailer';
import config from '@/config/env';
import { bookingAcceptedTemplate, bookingRejectedTemplate } from '@/utils/emailTemplates';
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils';
import { razorpay } from '@/config/razorpay';

const controller = {
    createBooking: async (req: Request, res: Response) => {
        try {
            const userID = res.locals.userID! as string;

            const existingUser = await User.findById(userID);

            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User Not Found',
                });
            }

            const schema = z.object({
                restaurantID: z.string(),
                bookingAt: z
                    .string()
                    .refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format' }),
                numberOfGuests: z.number().min(1),
                message: z.string().default(''),
                category: z.enum(['breakfast', 'lunch', 'dinner']),
                phoneNumber: z.string().min(10).max(10),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Usage',
                    error: z.treeifyError(result.error),
                });
            }

            const { restaurantID, bookingAt, numberOfGuests, message, category, phoneNumber } =
                result.data;

            const existingRestaurant = await Restaurant.findById(restaurantID);

            if (!existingRestaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant Not Found',
                });
            }

            const newBooking = new Booking({
                userID: userID,
                restaurantID: restaurantID,
                bookingAt,
                numberOfGuests,
                message,
                status: 'pending',
                category,
                phoneNumber,
            });

            await newBooking.save();

            const io = getIO();
            io.to(`restaurant-${restaurantID}`).emit('new-booking', {
                message: 'New booking received!',
                data: {
                    ...result.data,
                    bookingID: newBooking._id,
                    timestamp: new Date(bookingAt),
                    fullName: `${existingUser.firstName} ${existingUser.lastName}`,
                    email: existingUser.email,
                },
            });

            return res.status(201).json({
                success: true,
                message: 'Booking created successfully',
            });
        } catch (error) {
            console.error('Error creating booking:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create booking',
            });
        }
    },

    getBookingsByRestaurant: async (req: Request, res: Response) => {
        try {
            const userID = res.locals.userID! as string;

            const existingRestaurant = await Restaurant.findOne({
                owner: userID,
            });

            if (!existingRestaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant Not Found',
                });
            }

            const bookings = await Booking.find({
                restaurantID: existingRestaurant._id,
            }).sort({ createdAt: -1 });

            const data = bookings.map(async (booking: IBooking) => {
                const existingUser = await User.findById(booking.userID);

                return {
                    bookingID: booking._id,
                    userID: booking.userID,
                    restaurantID: booking.restaurantID,
                    bookingAt: booking.bookingAt,
                    numberOfGuests: booking.numberOfGuests,
                    message: booking.message,
                    status: booking.status,
                    category: booking.category,
                    phoneNumber: booking.phoneNumber,
                    fullName: existingUser
                        ? `${existingUser.firstName} ${existingUser.lastName}`
                        : 'Unknown User',
                    email: existingUser ? existingUser.email : 'Unknown Email',
                };
            });

            const resolvedData = await Promise.all(data);

            return res.status(200).json({
                success: true,
                message: 'Bookings fetched successfully',
                data: resolvedData,
            });
        } catch (error) {
            logger.error('Error fetching bookings by restaurant:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch bookings',
            });
        }
    },

    getBookingsByCustomer: async (req: Request, res: Response) => {
        try {
            const userID = res.locals.userID! as string;

            const existingUser = await User.findById(userID);

            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User Not Found',
                });
            }

            const bookings = await Booking.find({
                userID: userID,
            }).sort({ createdAt: -1 });

            const data = bookings.map(async (booking: IBooking) => {
                return {
                    bookingID: booking._id,
                    userID: booking.userID,
                    restaurantID: booking.restaurantID,
                    bookingAt: booking.bookingAt,
                    numberOfGuests: booking.numberOfGuests,
                    message: booking.message,
                    status: booking.status,
                    category: booking.category,
                    phoneNumber: booking.phoneNumber,
                    fullName: `${existingUser.firstName} ${existingUser.lastName}`,
                    email: existingUser.email,
                };
            });

            const resolvedData = await Promise.all(data);

            return res.status(200).json({
                success: true,
                message: 'Bookings fetched successfully',
                data: resolvedData,
            });
        } catch (error) {
            logger.error('Error fetching bookings by customer:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch bookings',
            });
        }
    },

    changeBookingStatusR: async (req: Request, res: Response) => {
        try {
            const userID = res.locals.userID! as string;

            const schema = z.object({
                bookingID: z.string(),
                newStatus: z.enum(['payment pending', 'rejected', 'executed']),
            });

            const result = schema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Usage',
                    error: z.treeifyError(result.error),
                });
            }

            const { bookingID, newStatus } = result.data;
            const existingBooking = await Booking.findById(bookingID);

            if (!existingBooking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking Not Found',
                });
            }

            const existingRestaurant = await Restaurant.findOne({
                _id: existingBooking.restaurantID,
                owner: userID,
            });

            if (!existingRestaurant) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You do not own this restaurant',
                });
            }

            if (existingBooking.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot change the status of a non-pending booking',
                });
            }

            const existingUser = await User.findById(existingBooking.userID);

            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            if (newStatus === 'rejected') {
                const emailHTML = bookingRejectedTemplate(
                    existingUser.firstName,
                    existingUser.lastName,
                    existingBooking.category,
                    existingBooking.bookingAt.toISOString(),
                    bookingID,
                );

                const options = {
                    from: config.SENDER_EMAIL,
                    to: existingUser.email,
                    subject: `Booking Cancelled - Booking ID: ${bookingID}`,
                    html: emailHTML,
                };

                await transporter.sendMail(options);

                existingBooking.status = 'rejected';
                await existingBooking.save();

                return res.status(200).json({
                    success: true,
                    message: 'Booking rejected and notification sent',
                });
            } else if (newStatus === 'payment pending') {
                const paymentLink = await razorpay.paymentLink.create({
                    amount: existingBooking.numberOfGuests * 5000,
                    currency: 'INR',
                    description: `Reservation Token for Booking #${bookingID}`,
                    customer: {
                        name: `${existingUser.firstName} ${existingUser.lastName}`,
                        email: existingUser.email,
                    },
                    notify: {
                        email: true,
                    },
                    callback_url: `${config.FRONTEND_URL}/callback`,
                    callback_method: 'get',
                });

                const emailHTML = bookingAcceptedTemplate(
                    existingUser.firstName,
                    existingUser.lastName,
                    existingBooking.category,
                    existingBooking.bookingAt.toISOString(),
                    existingBooking.numberOfGuests,
                    bookingID,
                    paymentLink.short_url,
                );

                const options = {
                    from: config.SENDER_EMAIL,
                    to: existingUser.email,
                    subject: `Booking Confirmed - ${existingBooking.category} at ${new Date(existingBooking.bookingAt).toLocaleString()}`,
                    html: emailHTML,
                };

                existingBooking.status = 'payment pending';
                existingBooking.paymentLinkID = paymentLink.id;
                existingBooking.paymentLinkURL = paymentLink.short_url;
                await existingBooking.save();
                logger.debug('aaaaaaaaaaaaaaa');
                await transporter.sendMail(options);
                logger.debug('aaaaaaaaaaaaaaa');
                return res.status(200).json({
                    success: true,
                    message: 'Booking accepted and confirmation sent',
                });
            }
        } catch (error) {
            logger.error('Error in changeBookingStatusR', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to change booking status',
            });
        }
    },

    paymentCallback: async (req: Request, res: Response) => {
        try {
            /**
             * 
             * This is what we get from Razorpay as query params
             * 
             * RAZORPAY => client => callback page => server (this endpoint) ==> validate and update booking status
             * 
             *  const razorpay_payment_id = searchParams.get("razorpay_payment_id");
                const razorpay_payment_link_id = searchParams.get("razorpay_payment_link_id");
                const razorpay_payment_link_reference_id = searchParams.get("razorpay_payment_link_reference_id");
                const razorpay_payment_link_status = searchParams.get("razorpay_payment_link_status");
                const razorpay_signature = searchParams.get("razorpay_signature");
             */

            logger.debug('Payment Callback Body:', req.body);

            const schema = z.object({
                razorpay_payment_id: z.string(),
                razorpay_payment_link_id: z.string(),
                razorpay_payment_link_reference_id: z.string(), // THIS IS NOT ENABLED IN TEST MODE => FOR THE TEST MODE, THIS IS WILL EMPTY STRING
                razorpay_payment_link_status: z.string(),
                razorpay_signature: z.string(),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid request body',
                    error: z.treeifyError(result.error),
                    bookingDone: false,
                });
            }

            const {
                razorpay_payment_id,
                razorpay_payment_link_id,
                razorpay_payment_link_status,
                razorpay_payment_link_reference_id,
                razorpay_signature,
            } = result.data;

            const existingBooking = await Booking.findOne({
                paymentLinkID: razorpay_payment_link_id,
            });

            if (!existingBooking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found',
                    bookingDone: false,
                });
            }

            if (razorpay_payment_link_status !== 'paid') {
                existingBooking.status = 'rejected';
                await existingBooking.save();

                return res.status(200).json({
                    success: true,
                    message: 'Payment not completed, booking rejected',
                    bookingDone: false,
                });
            }

            // PAID CASE : VERIFICATION OF SIGNATURE CAN BE DONE HERE IF NEEDED

            const isValidSignature = validatePaymentVerification(
                {
                    payment_link_id: razorpay_payment_link_id,
                    payment_id: razorpay_payment_id,
                    payment_link_reference_id: razorpay_payment_link_reference_id,
                    payment_link_status: razorpay_payment_link_status,
                },
                razorpay_signature,
                config.RAZORPAY_KEY_SECRET,
            );

            if (!isValidSignature) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid signature, verification failed',
                });
            }

            existingBooking.status = 'confirmed';
            // existingBooking.razorpayPaymentID = razorpay_payment_id;
            await existingBooking.save();

            return res.status(200).json({
                success: true,
                message: 'Status Updated Successfully',
                bookingDone: true,
            });
        } catch (error) {
            logger.error('Error in payment Callback Funtion', error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                bookingDone: false,
            });
        }
    },

    exceuteBooking: async (req: Request, res: Response) => {
        try {
            const userID = res.locals.userID! as string;

            const schema = z.object({
                bookingID: z.string(),
            });

            const result = schema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Usage',
                    error: z.treeifyError(result.error),
                });
            }

            const { bookingID } = result.data;

            const existingRestaurant = await Restaurant.findOne({
                owner: userID,
            });

            if (!existingRestaurant) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: You do not own this restaurant',
                });
            }

            const existingBooking = await Booking.findOne({
                _id: bookingID,
                restaurantID: existingRestaurant._id,
                status: 'confirmed',
            });

            if (!existingBooking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking Not Found',
                });
            }

            const ok = new Date() > existingBooking.bookingAt;

            if (!ok) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot exceute the Booking Before booking time',
                });
            }

            existingBooking.status = 'executed';
            await existingBooking.save();

            return res.status(200).json({
                success: true,
                message: 'Booking Executed',
                note: `You will receive ${existingBooking.numberOfGuests * 40} Rs in 3-4 Working Days`,
            });
        } catch (error) {
            logger.error('Error in Exceute Booking', error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    },
};

export default controller;
