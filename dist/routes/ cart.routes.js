"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
//@ts-ignore
router.post("/add", auth_middleware_1.authenticate, cart_controller_1.addToCart); // Fixed type error
//@ts-ignore
router.get("/user-items", auth_middleware_1.authenticate, cart_controller_1.getCartItems);
//@ts-ignore
router.delete("/remove/:itemId", auth_middleware_1.authenticate, cart_controller_1.removeCartItem);
const cartRoutes = router;
exports.default = cartRoutes;
