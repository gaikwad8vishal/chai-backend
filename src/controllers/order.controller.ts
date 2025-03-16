import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware"; // ✅ Ensure type safety

const prisma = new PrismaClient();

// ✅ Place Order (using token's userId)
export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    // Calculate total price
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: req.userId, // Using token's userId
        totalPrice,
        items: {
          create: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true }, //  Include order items in response
    });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ Get User Orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    console.log("Fetching orders for userId:", req.userId); // ✅ Debugging log

    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    if (orders.length === 0) {
      return res.json({ message: "No orders found", orders: [] });
    }

    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Something went wrong while fetching orders" });
  }
};
