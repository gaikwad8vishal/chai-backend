import express from "express";
import { authenticate, isDeliveryPerson,  } from "../middleware/auth.middleware";
import { getAssignedOrders, getMyAssignedOrders, updateOrderDeliveryStatus } from "../controllers/delivery.controller";

const router = express.Router();

// 🔹 Delivery person can view assigned orders

//@ts-ignore
router.get("/my-orders", authenticate, isDeliveryPerson, getAssignedOrders);
//@ts-ignore
router.get("/my-orders", authenticate,isDeliveryPerson, getMyAssignedOrders); // ✅ Assigned orders dekhne ke liye
//@ts-ignore
router.patch("/update-status", authenticate,isDeliveryPerson, updateOrderDeliveryStatus); // ✅ Status update karne ke liye

export default router;
