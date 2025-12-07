import { NextFunction, Request, Response } from 'express';

export const protectCustomer = async (req: Request, res: Response, next: NextFunction) => {
    res.locals.role = 'customer';
    next();
};
