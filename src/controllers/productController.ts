import { Request, Response } from "express";
import prisma from "../config/db"; // Prisma instance import karna mat bhoolna

// ✅ Fetch All Products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
