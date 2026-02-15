export interface Order {
    id?: string; // Refers to the unique identifier of the order, typically a UUID or a string
    customerId?: string; // Refers to the unique identifier of the customer placing the order
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number; // float value representing the total cost of the order
    status: 'pending' | 'processing' | 'completed' | 'cancelled'; // Enum for order status
    createdAt: Date; // Refers the order creation time, ISO 8601 format
    updatedAt: Date; // ISO 8601 format , gets updated whenever status of the order is modified
}
