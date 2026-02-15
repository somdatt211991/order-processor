import { Router } from "express";
import { samlAuthenticationMiddleware } from "../middlewares/authentication";
import { getChannel } from "../rabbitmq/rabbitmq";

const router = Router();

router.get('/health', (_req, res) => {
    res.json({ status: 'Service is Up & Running :)', timestamp: new Date().toISOString() });
});

export default router;
