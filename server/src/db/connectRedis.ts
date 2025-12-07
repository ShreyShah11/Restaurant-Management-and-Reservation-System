// redis.ts
import config from '@/config/env';
import logger from '@/utils/logger';
import { createClient } from 'redis';

let client = createClient();

if (!config.LOCAL_REDIS) {
    client = createClient({
        username: config.REDIS_USERNAME,
        password: config.REDIS_PASSWORD,
        socket: {
            host: config.REDIS_HOST,
            port: config.REDIS_PORT,
        },
    });
}

client.on('error', (error: Error) => {
    logger.error('Redis Client Error', error);
});

client.on('connect', () => {
    logger.info('Redis Client Connected');
});

const connectRedis = async (): Promise<void> => {
    try {
        await client.connect();
    } catch (error) {
        logger.error('Redis Client Connection Failed', error);
        process.exit(1);
    }
};

export { connectRedis, client as redisClient };
