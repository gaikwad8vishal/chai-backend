"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// @ts-ignore
router.post("/place", auth_middleware_1.authenticate, order_controller_1.placeOrder);
// @ts-ignore
router.get("/user-order", auth_middleware_1.authenticate, order_controller_1.getUserOrders);
exports.default = router;
