import { IUser } from '@/models/user';
import { readableDate, readableTime } from '@/utils/date';

export const packUserData = (existingUser: IUser) => {
    const now = new Date(existingUser.createdAt);

    return {
        _id: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        createdAt: `${readableDate(now)} ${readableTime(now)}`,
        role: existingUser.role,
    };
};
