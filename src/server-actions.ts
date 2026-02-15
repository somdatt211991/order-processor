import { IncomingMessage, Server, ServerResponse } from "http";

export const shutdown = (server: Server<typeof IncomingMessage, typeof ServerResponse>) => {
    console.log('Shutting down server...');
    return server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};