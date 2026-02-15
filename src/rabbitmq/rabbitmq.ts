import { Channel, ChannelModel, connect } from 'amqplib';

let channel: Channel | null = null;

export type ConnectToRabbitMQResult = {
    connection: ChannelModel;
    channel: Channel;
};

export const connectToRabbitMQ = async (): Promise<ConnectToRabbitMQResult> => {
    const connection = await connect(process.env.RABBITMQ_URI as string || 'amqp://localhost:5672');
    channel = await connection.createChannel();
    // create a connection to the rabbitmq server.
    return { connection, channel };
};

export const getChannel = (): Channel => {
    if (!channel) {
        throw new Error('Channel not connected');
    }
    return channel;
};

// export const sendMessageToQueue = async (channel: Channel, queueName: string, message: string) => {
//     // assertQueue is used to create a queue if it doesn't exist.
//     await channel.assertQueue(queueName);
//     // sendToQueue is used to send a message to a queue. It is a synchronous operation.
//     await channel.sendToQueue(queueName, Buffer.from(message));
// }

// export const receiveMessageFromQueue = async (channel: Channel, queueName: string) => {
//     await channel.assertQueue(queueName);
//     return await channel.consume(queueName, (msg) => {
//         if (msg !== null) {
//             console.log(`Received message: ${msg.content.toString()}`);
//         }
//     });
// }
