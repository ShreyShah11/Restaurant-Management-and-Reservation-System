import { initSocket, getSocket, connectSocket, disconnectSocket } from '@/lib/socket';

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('socket.io-client', () => {
  let mockConnected = false;
  return {
    io: jest.fn(() => ({
      connect: () => { mockConnected = true; mockConnect(); },
      disconnect: () => { mockConnected = false; mockDisconnect(); },
      get connected() { return mockConnected; },
      set connected(v) { mockConnected = v; },
    })),
  };
});

describe('lib/socket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // reset module state so singleton is fresh
    jest.resetModules();
  });

  test('getSocket throws before init', () => {
    const { getSocket: freshGetSocket } = require('@/lib/socket');
    expect(() => freshGetSocket()).toThrow(/Socket not initialized/);
  });

  test('initSocket returns singleton', () => {
    const s1 = initSocket('http://localhost:1234');
    const s2 = initSocket('http://localhost:1234');
    expect(s1).toBe(s2);
  });

  test('connectSocket connects only when not connected', () => {
    initSocket('x');
    connectSocket();
    expect(mockConnect).toHaveBeenCalledTimes(1);
    // second call should not call connect again
    connectSocket();
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  test('disconnectSocket disconnects only when connected', () => {
    initSocket('x');
    // ensure not connected yet, disconnect should be no-op
    const s = getSocket();
    s.connected = false;
    disconnectSocket();
    expect(mockDisconnect).not.toHaveBeenCalled();
    // connect and then disconnect
    connectSocket();
    disconnectSocket();
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});
