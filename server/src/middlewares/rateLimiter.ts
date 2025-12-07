import RedisStore from 'rate-limit-redis';
import rateLimit from 'express-rate-limit';

import config from '@/config/env';
import logger from '@/utils/logger';
import { redisClient } from '@/db/connectRedis';

export const createRateLimiter = ({
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    prefix = 'rate-limit',
}: {
    windowMs: number;
    max: number;
    message?: string;
    prefix?: string;
}) => {
    return rateLimit({
        store: new RedisStore({
            sendCommand: (...args: string[]) => redisClient.sendCommand(args),
            prefix,
        }),
        windowMs: windowMs,
        max: config.isProduction ? max : Infinity,
        standardHeaders: true,
        legacyHeaders: false,
        skipFailedRequests: false,
        skipSuccessfulRequests: false,

        handler: (req, res, _next, options) => {
            logger.warn(
                `Rate limit exceeded for IP: ${req.ip} (limit: ${options.max}, window: ${options.windowMs}ms, prefix: ${prefix})`,
            );

            res.status(options.statusCode).json({
                success: false,
                message,
                remaining: 0,
                resetTime: new Date(Date.now() + options.windowMs),
            });
        },
    });
};
