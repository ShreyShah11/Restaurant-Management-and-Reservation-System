import config from '@/config/env';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, errors, json } = format;

const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${level.toUpperCase()}] [${timestamp}]: ${stack || message} ${metaString}`;
});

const fileFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const logEntry = {
        timestamp,
        level,
        message: stack || message,
        ...meta,
    };
    return JSON.stringify(logEntry);
});

const logger = createLogger({
    level: config.isProduction ? 'info' : 'debug',
    format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
    transports: [
        new transports.Console({
            format: config.isProduction ? combine(json()) : combine(devFormat),
        }),

        ...(config.isProduction
            ? [
                  new DailyRotateFile({
                      filename: 'logs/app-%DATE%.log',
                      datePattern: 'YYYY-MM-DD',
                      zippedArchive: true,
                      maxSize: '20m',
                      maxFiles: '14d',
                      level: 'info',
                      format: combine(fileFormat),
                  }),
                  new DailyRotateFile({
                      filename: 'logs/error-%DATE%.log',
                      datePattern: 'YYYY-MM-DD',
                      zippedArchive: true,
                      maxSize: '20m',
                      maxFiles: '30d',
                      level: 'error',
                      format: combine(fileFormat),
                  }),
              ]
            : [
                  new transports.File({
                      filename: 'logs/debug-dev-mode.log',
                      level: 'debug',
                      format: combine(fileFormat),
                  }),
              ]),
    ],
    exitOnError: false,
});

logger.on('error', (err) => {
    logger.error('Logger error:', err);
});

export default logger;
