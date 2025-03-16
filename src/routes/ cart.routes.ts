import express from "express";
import { addToCart, getCartItems, removeCartItem } from "../controllers/cart.controller";

const router = express.Router();

//@ts-ignore
router.post("/add", addToCart);
//@ts-ignore
router.get("/user-item", getCartItems);

router.delete("/remove/:iztemId", removeCartItem);

export default router;
