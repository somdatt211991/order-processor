import { getChannel } from "./rabbitmq";

async function consumeMessages(taskQueue: string) {
    const channel = getChannel();
    channel.consume(taskQueue, (msg) => {
        if (msg !== null) {
            console.log("Processing message:", msg.content.toString());
            // Acknowledge the message so it's removed from queue
            channel.ack(msg); 
        }
    });
}

export default consumeMessages;
