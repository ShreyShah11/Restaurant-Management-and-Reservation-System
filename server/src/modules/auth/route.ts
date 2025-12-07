import { Router } from 'express';
import controller from '@/modules/auth/controller';
import { protectRoute } from '@/middlewares/protectRoute';
import { createRateLimiter } from '@/middlewares/rateLimiter';

const router = Router();

router.post(
    '/send-otp-for-verification',
    createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: 'Too many OTP requests from this IP, please try again after 15 minutes.',
        prefix: 'send-otp-for-verification',
    }),
    controller.sendOTPForVerification,
);

router.post(
    '/verify-otp-for-verification',
    createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message:
            'Too many OTP verification attempts from this IP, please try again after 15 minutes.',
        prefix: 'verify-otp-for-verification',
    }),
    controller.verifyOTPForVerification,
);

router.post(
    '/create-account',
    createRateLimiter({
        windowMs: 5 * 60 * 1000,
        max: 10,
        message:
            'Too many account creation attempts from this IP, please try again after 5 minutes.',
        prefix: 'create-account',
    }),
    controller.createAccount,
);

router.post(
    '/login',
    createRateLimiter({
        windowMs: 5 * 60 * 1000,
        max: 5,
        message: 'Too many login attempts. Please try again later.',
        prefix: 'login',
    }),
    controller.login,
);

router.post('/logout', controller.logout);

router.post(
    '/reset-password/send-otp',
    createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: 'Too many OTP requests from this IP, please try again after 15 minutes.',
        prefix: 'reset-password-send-otp',
    }),
    controller.sendOTP_resetPassword,
);

router.post(
    '/reset-password/verify-otp',
    createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message:
            'Too many OTP verification attempts from this IP, please try again after 15 minutes.',
        prefix: 'reset-password-verify-otp',
    }),
    controller.verifyOTP_resetPassword,
);

router.post('/reset-password/change-password', controller.changePassword_resetPassword);

router.post('/is-authenticated', protectRoute, controller.isAuthenticated);

router.post("/my-profile", protectRoute, controller.getMyProfile);

router.post("/update-profile", protectRoute, controller.updateProfile);


export default router;
