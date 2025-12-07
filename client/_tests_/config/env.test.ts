describe('config/env', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  const loadConfig = () => require('@/config/env').default;

  test('uses development URLs when NODE_ENV !== production', () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_BACKEND_URL_DEV = 'http://dev-backend';
    process.env.NEXT_PUBLIC_FRONTEND_URL_DEV = 'http://dev-frontend';

    const config = loadConfig();
    expect(config.PUBLIC_BACKEND_URL).toBe('http://dev-backend');
    expect(config.PUBLIC_FRONTEND_URL).toBe('http://dev-frontend');
  });

  test('uses production URLs when NODE_ENV === production', () => {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_BACKEND_URL_PROD = 'https://prod-backend';
    process.env.NEXT_PUBLIC_FRONTEND_URL_PROD = 'https://prod-frontend';

    const config = loadConfig();
    expect(config.PUBLIC_BACKEND_URL).toBe('https://prod-backend');
    expect(config.PUBLIC_FRONTEND_URL).toBe('https://prod-frontend');
  });
});

