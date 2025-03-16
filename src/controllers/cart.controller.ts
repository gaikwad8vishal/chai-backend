import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware"; // Middleware for authentication

const prisma = new PrismaClient();



// ✅ Add item to cart
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { name, quantity, price } = req.body;

    if (!req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    let cart = await prisma.cart.findUnique({
        where: { userId: req.userId }
      });

    if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: req.userId }
        });
      }

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        name,
        quantity,
        price,
      },
    });

    res.json({ message: "Item added to cart", cartItem });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ Get user cart items
export const getCartItems = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
      include: { items: true },
    });

    res.json(cart?.items || []);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ Remove item from cart
export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;

    await prisma.cartItem.delete({ where: { id: itemId } });

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ Clear cart after checkout
export const clearCart = async (userId: string) => {
  await prisma.cartItem.deleteMany({
    where: { cart: { userId } },
  });
};
