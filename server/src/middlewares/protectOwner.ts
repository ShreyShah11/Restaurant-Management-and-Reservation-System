import { NextFunction, Request, Response } from 'express';

export const protectOwner = async (req: Request, res: Response, next: NextFunction) => {
    res.locals.role = 'owner';
    next();
};
