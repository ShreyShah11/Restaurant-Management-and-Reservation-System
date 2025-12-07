import dotenv from 'dotenv';
import process from 'process';

const NODE_ENV = process.env.NODE_ENV as 'production' | 'development';

if (NODE_ENV === 'development') {
    const result = dotenv.config({
        path: '.env.development',
    });
    if (result.error) {
        console.error('Env Files not configured');
        process.exit(1);
    }
} else {
    const result = dotenv.config();
    if (result.error) {
        console.error('Env Files not configured');
        process.exit(1);
    }
}

const config = {
    NODE_ENV,
    isProduction: NODE_ENV === 'production',

    PORT: Number(process.env.PORT) as number,

    MONGODB_URI: process.env.MONGODB_URI as string,
    JWT_KEY: process.env.JWT_KEY as string,

    REDIS_USERNAME: process.env.REDIS_USERNAME as string,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
    REDIS_HOST: process.env.REDIS_HOST as string,
    REDIS_PORT: Number(process.env.REDIS_PORT) as number,
    LOCAL_REDIS: Number(process.env.LOCAL_REDIS) as number,

    EMAIL_HOST: process.env.EMAIL_HOST as string,
    EMAIL_PORT: Number(process.env.EMAIL_PORT) as number,
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD as string,
    SENDER_EMAIL: process.env.SENDER_EMAIL as string,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY as string,

    BACKEND_URL_DEV: process.env.BACKEND_URL_DEV as string,
    BACKEND_URL_PROD: process.env.BACKEND_URL_PROD as string,
    FRONTEND_URL_DEV: process.env.FRONTEND_URL_DEV as string,
    FRONTEND_URL_PROD: process.env.FRONTEND_URL_PROD as string,

    BACKEND_URL:
        NODE_ENV === 'production'
            ? (process.env.BACKEND_URL_PROD as string)
            : (process.env.BACKEND_URL_DEV as string),
    FRONTEND_URL:
        NODE_ENV === 'production'
            ? (process.env.FRONTEND_URL_PROD as string)
            : (process.env.FRONTEND_URL_DEV as string),

    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY as string,

    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID as string,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET as string,
} as const;

export default config;
