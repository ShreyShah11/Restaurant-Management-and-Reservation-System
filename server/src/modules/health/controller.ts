import { readableDate, readableTime } from '@/utils/date';
import { Request, Response } from 'express';

const controller = {
    index: (req: Request, res: Response) => {
        return res.status(200).json({
            success: true,
            message: 'API is healthy',
            time: `${readableTime()} on ${readableDate()}`,
        });
    },
};

export default controller;
