// Implement the class which initiates the queue creation and binding in rabbitmq at the time of server startup.

import { Channel } from 'amqplib';
import { MongoClient } from 'mongodb';

import { Order } from '../types/order';

const DB_NAME = process.env.MONGO_INITDB_DATABASE || 'order-processor-db';
const COLLECTION_NAME = process.env.DATABASE_COLLECTION || 'orders';

export class Queues {
    private channel: Channel | null = null;
    private mongoClient: MongoClient | null = null;

    constructor(channel: Channel, mongoClient?: MongoClient) {
        this.channel = channel;
        this.mongoClient = mongoClient ?? null;
        this.orderQueue();
        this.healthCheckQueue();
    }

    private orderQueue() {
        this.channel?.assertQueue('order-queue');

        this.channel?.consume('order-queue', async (message) => {
            if (!message) return;

            try {
                const payload = JSON.parse(message.content.toString()) as Order;
                const order = {
                    ...payload,
                    createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
                    updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
                };

                if (this.mongoClient) {
                    const collection = this.mongoClient.db(DB_NAME).collection(COLLECTION_NAME);
                    await collection.insertOne(order);
                    this.channel?.ack(message);
                    
                } else {
                    console.warn('order-queue: MongoDB client not available, message not persisted');
                    this.channel?.nack(message, false, true);
                }
            } catch (err) {
                console.error('order-queue: failed to persist order', err);
                this.channel?.nack(message, false, true);
            }
        });
    }

    private healthCheckQueue() {
        // Initiating helathCheck-queue
        this.channel?.assertQueue('healthCheck-queue');

        // initialize the order-queue consumer here 
        this.channel?.consume('healthCheck-queue', (message)=>{
            console.log(`consumer of healthCheck-queue`, message?.content.toLocaleString());
        })
        console.log(`starting healthCheck-queue`);
    }

}