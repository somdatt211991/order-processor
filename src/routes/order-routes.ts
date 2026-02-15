import { Request, Router } from "express";
import orderSchema from "../joi/order-schema";
import { Order } from "../types/order";
import { generateOrderId } from "../utilities/order-utilities";
import { getChannel } from "../rabbitmq/rabbitmq";


// Create a router for order-related routes
const router = Router()

/**
 * POST /order - Create a new order
 * Request body should contain the order details in JSON format. The order will be validated against the orderSchema using Joi.
 * If the validation succeeds, a 201 Created response will be sent with a success message and the created order details.
 * Request is Typescript Generic and is used to specify the expected shape of the request body, which is an Order object in this case and
 */
router.post('/order', (req: Request<{}, { status: Order['status'], orderId: Order['id'] } | Error, Order>, res) => {

    try {
        const { error } = orderSchema.validate(req.body);

        if (error) {
            return res.status(400).json(new Error(error.details?.[0]?.message ?? "Invalid order"));
        }

        const date = new Date();
        // If validation is successful, create the order (this is a placeholder - in a real application, you would save the order to a database);
        const order: Order = {
            ...req.body,
            id: generateOrderId("ORD"), // Generate a unique order ID
            status: 'pending', // Set initial status to 'pending'
            createdAt: date,
            updatedAt: date
        };

        const channel = getChannel();
        channel.sendToQueue('order-queue', Buffer.from(JSON.stringify(order)), { persistent: true });

        return res.status(201).json({ status: order.status, orderId: order.id });
    } catch (err) {
        return res.status(400).json(new Error('Order couldn\'t be processed'));
    }
});

export default router;