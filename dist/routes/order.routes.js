"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const cart_controller_1 = require("../controllers/cart.controller");
const router = express_1.default.Router();
// @ts-ignore
router.post("/place", auth_middleware_1.authenticate, order_controller_1.placeOrder);
// @ts-ignore
router.get("/user-order", auth_middleware_1.authenticate, order_controller_1.getUserOrders);
// @ts-ignore
router.put("/cancel/:id", auth_middleware_1.authenticate, admin_controller_1.cancelOrder);
router.post("/add-to-cart", auth_middleware_1.authenticate, cart_controller_1.addToCart); // Fixed type error
//@ts-ignore
router.get("/get-cart-items", auth_middleware_1.authenticate, cart_controller_1.getCartItems);
//@ts-ignore
router.delete("/remove-from-cart/:itemId", auth_middleware_1.authenticate, cart_controller_1.removeCartItem);
exports.default = router;
