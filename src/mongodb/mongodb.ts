// Setup Mongo DB for order processor .
import { MongoClient } from "mongodb";

const MONGO_INITDB_ROOT_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME || 'sbhadvariya';
const MONGO_INITDB_ROOT_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || 'sbhadvariya';
const MONGO_SERVER_HOST = process.env.MONGO_SERVER_HOST || 'localhost'; // use this when running the application on the machine
const MONGO_SERVER_PORT = process.env.MONGO_SERVER_PORT || '27017';
const DB_NAME = process.env.MONGO_INITDB_DATABASE || 'order-processor-db';
const COLLECTION_NAME = process.env.DATABASE_COLLECTION || 'orders';

export class MongoDb {
    private mongoClient: MongoClient | undefined;
    private connection: MongoClient | undefined;

    constructor() {
        this.mongoClient = undefined;
    }

    async connect() {
        this.mongoClient = new MongoClient(`mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_SERVER_HOST}:${MONGO_SERVER_PORT}`);
        await this.mongoClient.connect();
        this.connection = this.mongoClient;
        console.log(`successfully initiated mongoClient !`);
        return this.connection;
    }

    get connectionDetails() {
        if (!this.connection) {
            throw new Error('MongoDB connection is not initialised !!')
        }
        return this.connection;
    }

    // Print MongoDB data to console every second.
    startMongoDbLogInterval(client: MongoClient): void {
        setTimeout(async () => {
            try {
                const docs = await client.db(DB_NAME).collection(COLLECTION_NAME).find().toArray();
                console.log(`[MongoDB ${COLLECTION_NAME}]`, new Date().toISOString(), docs);
            } catch (err) {
                console.error('Failed to read MongoDB for log interval:', err);
            }
        }, 10000);
    }
}