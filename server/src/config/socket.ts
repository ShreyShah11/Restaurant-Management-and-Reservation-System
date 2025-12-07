import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from '@/config/env';
import logger from '@/utils/logger';

let io: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: config.FRONTEND_URL,
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        logger.info(`Client connected: ${socket.id}`);

        // Join restaurant-specific room
        socket.on('join-restaurant', (restaurantId: string) => {
            socket.join(`restaurant-${restaurantId}`);
            logger.info(`Socket ${socket.id} joined restaurant-${restaurantId}`);
        });

        // Leave restaurant room
        socket.on('leave-restaurant', (restaurantId: string) => {
            socket.leave(`restaurant-${restaurantId}`);
            logger.info(`Socket ${socket.id} left restaurant-${restaurantId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = (): SocketIOServer => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
