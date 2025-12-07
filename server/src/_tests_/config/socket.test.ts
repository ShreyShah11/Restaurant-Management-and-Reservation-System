const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    FRONTEND_URL: "https://frontend.example.com",
  },
}));

jest.mock("@/utils/logger", () => ({
  __esModule: true,
  default: mockLogger,
}));

const mockOn = jest.fn();
const mockSocketIoConstructor = jest.fn().mockImplementation((_server, _options) => {
  return {
    on: mockOn,
  } as any;
});

jest.mock("socket.io", () => ({
  Server: mockSocketIoConstructor,
}));

import { initializeSocket } from "@/config/socket";

describe("config/socket", () => {
  beforeEach(() => {
    mockOn.mockClear();
    jest.clearAllMocks();
  });

  it("initializes socket.io with FRONTEND_URL and registers handlers", () => {
    const httpServer: any = {};

    initializeSocket(httpServer);

    expect(mockSocketIoConstructor).toHaveBeenCalled();

    const [, options] = mockSocketIoConstructor.mock.calls[0];
    expect(options.cors.origin).toBe("https://frontend.example.com");

    const connectionHandler = mockOn.mock.calls.find(
      ([event]) => event === "connection"
    )?.[1];

    expect(typeof connectionHandler).toBe("function");

    const joinLeaveHandlers: Record<string, Function> = {};
    const fakeSocket: any = {
      id: "socket-1",
      join: jest.fn(),
      leave: jest.fn(),
      on: jest.fn((event, handler) => {
        joinLeaveHandlers[event] = handler;
      }),
    };

    connectionHandler(fakeSocket);

    joinLeaveHandlers["join-restaurant"]("123");
    joinLeaveHandlers["leave-restaurant"]("123");
    joinLeaveHandlers["disconnect"]();

    expect(fakeSocket.join).toHaveBeenCalledWith("restaurant-123");
    expect(fakeSocket.leave).toHaveBeenCalledWith("restaurant-123");
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it("throws when getIO is called before initializeSocket", () => {
    jest.resetModules();

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getIO } = require("@/config/socket");

      expect(() => getIO()).toThrow("Socket.io not initialized!");
    });
  });
});
