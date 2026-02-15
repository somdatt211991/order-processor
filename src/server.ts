import 'dotenv/config';
import express from 'express';
import { MongoClient } from 'mongodb';

import { MongoDb } from './mongodb/mongodb';
import { samlAuthenticationMiddleware } from './middlewares/authentication';
import { loggerMiddleware } from './middlewares/logger';
import { connectToRabbitMQ, ConnectToRabbitMQResult } from './rabbitmq/rabbitmq';
import { Queues } from './rabbitmq/queues';
import healthRoutes from './routes/health-routes';
import orderRoutes from './routes/order-routes';
import { shutdown } from './server-actions';

// Create Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Register all the routes here for the application
app.use('/', loggerMiddleware, samlAuthenticationMiddleware, healthRoutes, orderRoutes);

// Initiate MongoDB & RabbitMQ before server is spun up.
const init = async (): Promise<void> => {
    const mongo = new MongoDb();
    const [connection, rabbitmq]: [MongoClient, ConnectToRabbitMQResult] = await Promise.all([
        mongo.connect(),
        connectToRabbitMQ(),
    ]);
    new Queues(rabbitmq.channel, connection);
    mongo.startMongoDbLogInterval(connection);
    console.log('MongoDB connection established');
    console.log('RabbitMQ server started');
};

// Start the server only after init succeeds.
const main = async (): Promise<void> => {
    try {
        await init();
        const server = app.listen(3000, () => {
            console.log(`Server listening on port ${3000}`);
        });
        process.on('SIGINT', () => shutdown(server));
        process.on('SIGTERM', () => shutdown(server));
    } catch (err) {
        console.error('Failed to init (MongoDB/RabbitMQ):', err);
        process.exit(1);
    }
};

main();

export default app;
