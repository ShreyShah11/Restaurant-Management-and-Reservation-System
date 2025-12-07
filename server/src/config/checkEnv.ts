import { z } from 'zod';
import config from '@/config/env';
import logger from '@/utils/logger';

const envSchema = z.object({
    NODE_ENV: z.enum(['production', 'development']),
    isProduction: z.boolean(),

    PORT: z.number().min(1).max(65535),

    MONGODB_URI: z.url(),

    REDIS_USERNAME: z.string(),
    REDIS_PASSWORD: z.string(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.number(),
    LOCAL_REDIS: z.union([z.literal(0), z.literal(1)]),

    JWT_KEY: z.string().min(32),

    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.number(),
    SMTP_USER: z.string(),
    SMTP_PASSWORD: z.string(),
    SENDER_EMAIL: z.email(),
    SENDGRID_API_KEY: z.string(),

    BACKEND_URL_DEV: z.url(),
    BACKEND_URL_PROD: z.url(),
    FRONTEND_URL_DEV: z.url(),
    FRONTEND_URL_PROD: z.url(),

    BACKEND_URL: z.url(),
    FRONTEND_URL: z.url(),

    GOOGLE_GEMINI_API_KEY: z.string(),

    RAZORPAY_KEY_ID: z.string(),
    RAZORPAY_KEY_SECRET: z.string(),
});

type ConfigSchema = z.infer<typeof envSchema>;

const checkEnv = (): ConfigSchema => {
    const result = envSchema.safeParse(config);

    if (!result.success) {
        logger.error('Invalid environment configuration:', result.error.format());
        process.exit(1);
    } else {
        logger.info('Environment configuration is valid.');
    }

    return result.data;
};

export default checkEnv;
