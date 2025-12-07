import config from '@/config/env';

export async function uploadToCloudinary(file: File, uploadPreset: string): Promise<string> {
    const cloudName = config.PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    const text = await response.text();

    if (!response.ok) {
        throw new Error(`Failed to upload image to Cloudinary (${response.status})`);
    }

    const data = JSON.parse(text);

    return data.secure_url;
}
