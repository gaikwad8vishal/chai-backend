"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const delivery_controller_1 = require("../controllers/delivery.controller");
const router = express_1.default.Router();
// 🔹 Delivery person can view assigned orders
//@ts-ignore
router.get("/my-orders", auth_middleware_1.authenticate, auth_middleware_1.isDeliveryPerson, delivery_controller_1.getAssignedOrders);
//@ts-ignore
router.get("/my-orders", auth_middleware_1.authenticate, auth_middleware_1.isDeliveryPerson, delivery_controller_1.getMyAssignedOrders); // ✅ Assigned orders dekhne ke liye
//@ts-ignore
router.patch("/update-status", auth_middleware_1.authenticate, auth_middleware_1.isDeliveryPerson, delivery_controller_1.updateOrderDeliveryStatus); // ✅ Status update karne ke liye
exports.default = router;
