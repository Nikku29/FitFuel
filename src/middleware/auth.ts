import { Request, Response, NextFunction } from 'express';

/**
 * Authentication Middleware Stub
 * In a real app, verify Firebase ID token here.
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    // For now, checks if Authorization header exists or allows if handled elsewhere
    const authHeader = req.headers.authorization;

    if (authHeader) {
        // const token = authHeader.split(' ')[1];
        // Verify token...
        // Mock user for now
        (req as any).userId = 'mock-user-id';
        next();
    } else {
        // res.status(401).json({ error: 'No token provided' });
        // allowing for now to not break dev flow if testing without auth
        next();
    }
};
