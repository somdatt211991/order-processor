# Order Processor

A backend application for processing orders with MongoDB and RabbitMQ. Orders are validated via API, published to a queue, then consumed and persisted to MongoDB. Built with TypeScript and Express.js.

## Overview

The Order Processor is a REST API that:

1. Accepts order creation requests (POST `/order`) and validates them with Joi.
2. Publishes validated orders to the **order-queue** in RabbitMQ.
3. A consumer reads from **order-queue** and writes each order to a MongoDB collection.
4. Optional: logs MongoDB collection contents on an interval (for debugging).

The server starts only after both MongoDB and RabbitMQ connections are established.

## Features

- **Order API**: Create  with validation; returns order ID and status.
- **MongoDB**: Persistent storage; connection at startup with configurable database and collection.
- **RabbitMQ**: Queues `order-queue` (order persistence) and `healthCheck-queue` (health checks).
- **Consumer**: Order messages are consumed and inserted into MongoDB with ack/nack handling.
- **SAML authentication**: Middleware for protected routes (e.g. health/order).
- **Health check**: GET `/health` for service status.
- **TypeScript**: Full type safety; Express 5, MongoDB driver, amqplib.

## Tech Stack

| Layer        | Technology        |
| ------------ | ------------------ |
| Runtime      | Node.js            |
| Language     | TypeScript         |
| Framework    | Express.js 5.x     |
| Database     | MongoDB            |
| Message queue| RabbitMQ (amqplib) |
| Validation   | Joi                |
| Env loading  | dotenv             |

## Project Structure

```
order-processor/
├── src/
│   ├── mongodb/
│   │   └── mongodb.ts          # MongoDb class, connect(), optional log interval
│   ├── rabbitmq/
│   │   ├── rabbitmq.ts         # connectToRabbitMQ, getChannel
│   │   ├── queues.ts           # Queues: order-queue (→ MongoDB), healthCheck-queue
│   │   └── consumer.ts
│   ├── routes/
│   │   ├── health-routes.ts    # GET /health
│   │   └── order-routes.ts     # POST /order (validate → publish to order-queue)
│   ├── joi/
│   │   └── order-schema.ts     # Joi schema for order payload
│   ├── middlewares/
│   │   ├── authentication.ts   # SAML auth
│   │   └── logger.ts
│   ├── types/
│   │   └── order.ts            # Order interface
│   ├── utilities/
│   │   └── order-utilities.ts  # e.g. generateOrderId
│   ├── saml/
│   │   └── samlTokensDetails.ts
│   ├── server.ts               # Express app, init (Mongo + RabbitMQ), start server
│   └── server-actions.ts        # Graceful shutdown (SIGINT/SIGTERM)
├── package.json
├── tsconfig.json
├── .env.example                 # (optional) template for .env
└── README.md
```

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/somdatt211991/order-processor.git
   cd order-processor
   ```

2. **Install dependencies**

   ```bash
   yarn install
   # or
   npm install
   ```

3. **Environment variables**

   Create a `.env` file in `src/` (or project root, depending on where you run the app) with at least:

   ```env
   PORT=3000
   RABBITMQ_URI=amqp://localhost:5672

   MONGO_INITDB_ROOT_USERNAME=sbhadvariya
   MONGO_INITDB_ROOT_PASSWORD=sbhadvariya
   MONGO_SERVER_HOST=localhost
   MONGO_SERVER_PORT=27017
   MONGO_INITDB_DATABASE=order-processor-db
   DATABASE_COLLECTION=orders
   ```

   - **Local:** Use `MONGO_SERVER_HOST=localhost`.
   - **Docker (app in another container):** Use the MongoDB service name as host (e.g. `MONGO_SERVER_HOST=mongodb`) and ensure auth matches the container (see Docker section).

## Usage

### Development

```bash
yarn dev
# or
npm run dev
```

Runs with `NODE_ENV=development` and nodemon watching `src` (ts/js). Server starts only after MongoDB and RabbitMQ are connected.

### Production

```bash
yarn start
# or
npm start
```

Uses `tsx` to run `src/server.ts`. Listens on `PORT` (default 3000).

### Docker (RabbitMQ and MongoDB)

**RabbitMQ (with management UI):**

```bash
docker run -d --hostname rmq --name rabbit-server -p 8080:15672 -p 5672:5672 rabbitmq:management
```

- AMQP: `localhost:5672`  
- Management UI: http://localhost:8080

**MongoDB (with root user):**

```bash
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=sbhadvariya -e MONGO_INITDB_ROOT_PASSWORD=sbhadvariya mongodb/mongodb-community-server:latest
```

Use the same username/password in `.env`. For auth to work, the connection string must use `authSource=admin` (the code can be extended to add this if not already present). Optional: use MongoDB Compass for a GUI.

## API Endpoints

### Health

**GET** `/health`

Returns service status and timestamp.

**Response:**

```json
{
  "status": "Service is Up & Running :)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Create Order

**POST** `/order`

Validates the body, creates an order (ID, status, timestamps), publishes it to **order-queue**, and returns immediately. A consumer persists the order to MongoDB.

**Request body:**

```json
{
  "customerId": "CUST123",
  "items": [
    {
      "productId": "PROD001",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "totalAmount": 59.98
}
```

**Response:**

```json
{
  "status": "pending",
  "orderId": "ORD-1234567890"
}
```

**Order status values:** `pending` | `processing` | `completed` | `cancelled`

## Order flow

1. Client sends POST `/order` with validated payload.
2. Server generates `id`, sets `status: 'pending'`, `createdAt`, `updatedAt`, and publishes the order to RabbitMQ queue **order-queue**.
3. Consumer in `Queues` reads from **order-queue**, parses JSON, and inserts the order into MongoDB (`MONGO_INITDB_DATABASE` / `DATABASE_COLLECTION`). Message is ack’d on success, nack’d (requeued) on failure.

## Order schema (TypeScript)

```typescript
interface Order {
  id?: string;
  customerId?: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

## Scripts

| Script   | Command | Description                                      |
| -------- | ------- | ------------------------------------------------ |
| start    | `yarn start` / `npm start` | Run server with tsx                      |
| dev      | `yarn dev` / `npm run dev` | Dev mode with nodemon and NODE_ENV=development |
| test     | `yarn test` / `npm test`   | Placeholder (no tests yet)                |

## Dependencies (summary)

- **Production:** express, mongodb, joi, axios, typescript, ts-node  
- **Dev:** nodemon, tsx, cross-env, @types/amqplib, @types/express, @types/node  

Env loading is done via `dotenv/config` (add `dotenv` if not already in `package.json`).

## License

MIT

## Author

**Somdatt Bhadvariya**

## Repository

https://github.com/somdatt211991/order-processor
