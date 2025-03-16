import express from "express";
import { placeOrder,getUserOrders } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();
// @ts-ignore
router.post("/place", authenticate, placeOrder);
// @ts-ignore
router.get("/user-order", authenticate, getUserOrders);

export default router;
