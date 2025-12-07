import mongoose from 'mongoose';
import config from '@/config/env';
import logger from '@/utils/logger';

let isConnected = false;

const connectMongo = async (): Promise<typeof mongoose> => {
    if (isConnected) {
        return mongoose;
    }

    try {
        const conn = await mongoose.connect(config.MONGODB_URI as string);

        isConnected = true;
        logger.info(`MongoDB connected: ${conn.connection.name}`);
        return conn;
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        throw error;
    }
};

export default connectMongo;
