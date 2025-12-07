const mockConfig = jest.fn();

jest.mock("dotenv", () => ({
  __esModule: true,
  default: {
    config: (...args: any[]) => mockConfig(...args),
  },
  config: (...args: any[]) => mockConfig(...args),
}));

describe("config/env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    mockConfig.mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("loads .env.development when NODE_ENV is development", () => {
    process.env.NODE_ENV = "development";
    mockConfig.mockReturnValue({ error: undefined } as any);

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cfg = require("@/config/env").default;
      expect(mockConfig).toHaveBeenCalledWith({ path: ".env.development" });
      expect(cfg.NODE_ENV).toBe("development");
      expect(cfg.isProduction).toBe(false);
    });
  });

  it("loads default .env when NODE_ENV is production", () => {
    process.env.NODE_ENV = "production";
    mockConfig.mockReturnValue({ error: undefined } as any);

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cfg = require("@/config/env").default;
      expect(mockConfig).toHaveBeenCalledWith();
      expect(cfg.NODE_ENV).toBe("production");
      expect(cfg.isProduction).toBe(true);
    });
  });

  it("calls process.exit when dotenv.config returns an error", () => {
    process.env.NODE_ENV = "development";
    mockConfig.mockReturnValue({ error: new Error("fail") } as any);

    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as any);

    jest.isolateModules(() => {
      require("@/config/env");
    });

    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });

  it("calls process.exit when dotenv.config returns an error in production", () => {
    process.env.NODE_ENV = "production";
    mockConfig.mockReturnValue({ error: new Error("fail-prod") } as any);

    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((() => undefined) as any);

    jest.isolateModules(() => {
      require("@/config/env");
    });

    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });
});
