import { uploadToCloudinary } from '@/lib/cloudinary-upload';

jest.mock('@/config/env', () => ({ __esModule: true, default: { PUBLIC_CLOUDINARY_CLOUD_NAME: 'demo' } }));

describe('uploadToCloudinary', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn();
  });
  afterEach(() => {
    // @ts-ignore
    global.fetch = originalFetch;
  });

  test('uploads successfully and returns secure_url', async () => {
    const mockResp = { ok: true, text: async () => JSON.stringify({ secure_url: 'https://res.cloud/demo/img.jpg' }) } as any;
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResp);

    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    const url = await uploadToCloudinary(file, 'preset');
    expect(url).toBe('https://res.cloud/demo/img.jpg');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('throws on non-OK response', async () => {
    const mockResp = { ok: false, status: 400, text: async () => '{}' } as any;
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResp);

    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    await expect(uploadToCloudinary(file, 'preset')).rejects.toThrow(/Failed to upload/);
  });
});
