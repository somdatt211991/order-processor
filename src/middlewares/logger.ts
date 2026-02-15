// Create a middleware for logging incoming requests and their responses. This will help us track the flow of requests through the application and identify any issues.

import { Request, Response, NextFunction } from "express";

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url} ${req.headers['x-saml-token']} - ${new Date().toISOString()}`);
    
    // Listen for the 'finish' event on the response to log the status code after the response is sent
    res.on('finish', () => {
        console.log(`Response status: ${res.statusCode} - ${new Date().toISOString()}`);
    });

    next();
}