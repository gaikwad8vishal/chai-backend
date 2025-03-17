import { Router } from "express";
import { addToCart, getCartItems, removeCartItem } from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

//@ts-ignore
router.post("/add", authenticate as any , addToCart as any); // Fixed type error
//@ts-ignore
router.get("/user-items",authenticate, getCartItems as any); 
//@ts-ignore
router.delete("/remove/:itemId",authenticate, removeCartItem); 

const cartRoutes = router;
export default cartRoutes;
    