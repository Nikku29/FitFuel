/**
 * Logger utility for consistent application logging.
 * Currently wraps the console but can be extended to use services like Sentry or Winston.
 */

export const logger = {
    info: (message: string, meta?: any) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [INFO] ${message}`, meta ? JSON.stringify(meta) : '');
    },

    error: (message: string, meta?: any) => {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ERROR] ${message}`, meta ? JSON.stringify(meta) : '');
    },

    warn: (message: string, meta?: any) => {
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] [WARN] ${message}`, meta ? JSON.stringify(meta) : '');
    },

    debug: (message: string, meta?: any) => {
        // Only log debug in development
        if (import.meta.env.DEV) {
            const timestamp = new Date().toISOString();
            console.debug(`[${timestamp}] [DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
        }
    }
};
