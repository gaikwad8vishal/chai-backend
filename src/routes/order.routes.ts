import express from "express";
import { placeOrder,getUserOrders, assignDeliveryPerson } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";
import { cancelOrder, getAllOrders, updateOrderStatus } from "../controllers/admin.controller";

const router = express.Router();
// @ts-ignore
router.post("/place", authenticate, placeOrder);
// @ts-ignore
router.get("/user-order", authenticate, getUserOrders);
// @ts-ignore
router.put("/cancel/:id", authenticate, cancelOrder);


export default router;
