import Joi from 'joi';

/** Schema for POST /order request body. Server sets id, status, createdAt, updatedAt. */
const orderSchema = Joi.object({
    customerId: Joi.string().required(),
    items: Joi.array()
        .items(
            Joi.object({
                productId: Joi.string().required(),
                quantity: Joi.number().integer().positive().required(),
                price: Joi.number().positive().required(),
            })
        )
        .required()
        .min(1),
    totalAmount: Joi.number().positive().required(),
});

export default orderSchema;