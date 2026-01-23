import { Request, Response, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    // Stub for request validation
    // Could check schema validation here
    next();
};
