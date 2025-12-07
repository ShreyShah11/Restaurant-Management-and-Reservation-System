import crypto from 'crypto';

const generateOTP = (): string => {
    const otp = crypto.randomInt(0, 1000000);
    return otp.toString().padStart(6, '0');
};

export default generateOTP;
