import { uploadToCloudinary } from '@/lib/cloudinary-upload';

jest.mock('@/config/env', () => ({ __esModule: true, default: { PUBLIC_CLOUDINARY_CLOUD_NAME: '' } }));

describe('uploadToCloudinary - env missing', () => {
  test('throws when cloud name is not set', async () => {
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    await expect(uploadToCloudinary(file, 'preset')).rejects.toThrow('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
  });
});
