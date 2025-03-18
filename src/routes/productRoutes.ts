import express from "express";
import { getAllProducts } from "../controllers/productController";  


const router = express.Router();

// ✅ Public Route - Get All Products
router.get("/products", getAllProducts);

export default router;
