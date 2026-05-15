// ============================================================================
// Authentication Middleware (Supabase JWT verification)
// ============================================================================

import { Request, Response, NextFunction } from 'express';

/**
 * Authentication Middleware
 * In production, verify Supabase JWT token here using the Supabase
 * service role key or the `@supabase/ssr` server client.
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        // In production: verify JWT using supabase.auth.getUser(token)
        // const token = authHeader.split(' ')[1];
        // Mock user for now
        (req as any).userId = 'mock-user-id';
        next();
    } else {
        // Allowing for now to not break dev flow
        next();
    }
};
