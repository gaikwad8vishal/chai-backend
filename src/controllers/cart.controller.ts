import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware"; // Middleware for authentication

const prisma = new PrismaClient();

// ✅ Add item to cart
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { name, quantity, price } = req.body;

    if (!req.user?.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Find or create the cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id }
      });
    }

    // Check if the item already exists in the cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        name: name, // Matching item by name
      },
    });

    let cartItem;

    if (existingCartItem) {
      // If item exists, update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity }
      });
    } else {
      // If item doesn't exist, create new one
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          name,
          quantity,
          price,
        },
      });
    }

    res.json({ message: "Item added to cart", cartItem });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ Get user cart items
export const getCartItems = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
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
    console.log("Received itemId:", itemId);

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
