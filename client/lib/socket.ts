import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (url: string): Socket => {
    if (!socket) {
        socket = io(url, {
            withCredentials: true,
            autoConnect: false,
        });
    }
    return socket;
};

export const getSocket = (): Socket => {
    if (!socket) {
        throw new Error('Socket not initialized. Call initSocket first.');
    }
    return socket;
};

export const connectSocket = () => {
    const socket = getSocket();
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket && socket.connected) {
        socket.disconnect();
    }
};
