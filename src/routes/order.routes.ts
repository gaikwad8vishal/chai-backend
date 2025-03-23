import express from "express";
import { placeOrder,getUserOrders, assignDeliveryPerson } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";
import { cancelOrder, getAllOrders, updateOrderStatus } from "../controllers/admin.controller";
import { addToCart, getCartItems, removeCartItem } from "../controllers/cart.controller";

const router = express.Router();
// @ts-ignore
router.post("/place", authenticate, placeOrder);
// @ts-ignore
router.get("/user-order", authenticate, getUserOrders);
// @ts-ignore
router.put("/cancel/:id", authenticate, cancelOrder);

router.post("/add-to-cart", authenticate as any , addToCart as any); // Fixed type error
//@ts-ignore
router.get("/get-cart-items",authenticate, getCartItems as any); 
//@ts-ignore
router.delete("/remove-from-cart/:itemId",authenticate, removeCartItem); 


export default router;
