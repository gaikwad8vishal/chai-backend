import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { AuthRequest } from "../middleware/auth.middleware";


dotenv.config();
const prisma = new PrismaClient();

  export const makeAdmin = async (req: Request, res: Response) => {
    const { userId } = req.body;
  
    try {
      console.log("Received userId:", userId);
  
      if (!userId) {
        return res.status(400).json({ 
          error: "User ID is required" 
        });
      }
   //  Find user in DB
      const existingUser = await prisma.user.findUnique({ 
        where: { id: userId } 
      });

     
  
      if (!existingUser) {
        return res.status(404).json({ 
          error: "User not found" 
        });
      }

      if (existingUser.isAdmin) {
        return res.status(400).json({ 
          error: "User is already an Admin" 
        });
      }
  
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: "ADMIN",
          isAdmin: true,
        },
      });
  
      res.json({ message: `User ${updatedUser.username} is now an Admin` });
    } catch (error) {
      console.error("Error making admin:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  };
  




// to get all users


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true,  isBlocked: true, role: true },
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};



// to block or unblock a user
export const toggleBlockUser = async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      const user = await prisma.user.findUnique({ where: { id } });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Ensure that 'isBlocked' exists on user
      if (typeof user.isBlocked !== "boolean") {
        return res.status(400).json({ error: "Invalid user data" });
      }
  
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isBlocked: !user.isBlocked },
      });
  
      res.json({ message: `User ${updatedUser.isBlocked ? "blocked" : "unblocked"} successfully` });
    } catch (error) {
      console.error("Error updating user block status:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  };
  

// to delete a user
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ 
      where: { id } 
    });

    if (!user) return res.status(404).json({ 
      error: "User not found" 
    });

    await prisma.user.delete({ where: { id } });

    res.json({ 
      message: "User deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ 
      error: "Something went wrong" 
    });
  }
};





export const getAllOrders = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "ADMIN") {
        return res.status(403).json({ error: "Access denied" });
      }
  
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: true, items: true },
      });
  
      res.json({ orders });
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ 
        error: "Something went wrong" 
      });
    }
  };
  



  export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    const { id } = req.body;
    console.log("Received order ID:", id);
    const { status } = req.body;
  
    if (!req.user?.role || req.user.role !== "ADMIN") {
      return res.status(403).json({ 
        error: "Access denied" 
      });
    }
  
    try {
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status },
        include: { items: true },
      });
  
      res.json({ 
        message: `Order status updated to ${status}`, order: updatedOrder 
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  };

  

  export const cancelOrder = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        // ✅ Find order
        const order = await prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // ✅ If user is not admin, check if this order belongs to them
        if (!req.user?.role || (req.user.role !== "ADMIN" && order.userId !== req.user.id)) {
            return res.status(403).json({ 
              error: "You can only cancel your own orders"
            });
        }

        // ✅ Check if order is already delivered
        if (order.status === "DELIVERED") {
            return res.status(400).json({ 
              error: "Cannot cancel a delivered order" 
            });
        }

        // ✅ Update order status to "CANCELLED"
        const cancelledOrder = await prisma.order.update({
            where: { id },
            data: { status: "CANCELLED" },
        });

        res.json({ 
          message: "Order cancelled successfully", order: cancelledOrder 
        });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};




export const getOrderStats = async (req: AuthRequest, res: Response) => {
  try {
      if (!req.user?.role || req.user.role !== "ADMIN") {
          return res.status(403).json({ error: "Access denied" });
      }

      const totalOrders = await prisma.order.count();
      const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });
      const completedOrders = await prisma.order.count({ where: { status: "DELIVERED" } });
      const cancelledOrders = await prisma.order.count({ where: { status: "CANCELLED" } });

      const totalRevenue = await prisma.order.aggregate({
          _sum: { totalPrice: true },
          where: { status: "DELIVERED" },
      });

      res.json({
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue: totalRevenue._sum.totalPrice || 0,
      });
  } catch (error) {
      console.error("Error fetching order stats:", error);
      res.status(500).json({ error: "Something went wrong" });
  }
};


export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  try {
      if (!req.user?.role || (req.user.role !== "ADMIN" && req.user.id !== userId)) {
          return res.status(403).json({ error: "Access denied" });
      }

      const orders = await prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          include: { items: true },
      });

      if (!orders.length) {
          return res.status(404).json({ error: "No orders found for this user" });
      }

      res.json({ userId, orders });
  } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({ error: "Something went wrong" });
  }
};






// update role of a user 

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    // ✅ Admin Check
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admin can update user roles" });
    }

    const { userId } = req.params; // User ID from URL params
    const { role } = req.body; // New role from request body

    // ✅ Validate Role
    const validRoles = ["USER", "DELIVERY_PERSON", "ADMIN"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role provided" });
    }

    // ✅ Find Existing User
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ If User is Already the Given Role, No Need to Update
    if (existingUser.role === role) {
      return res.status(400).json({ error: `User is already a ${role}` });
    }

    // ✅ Update User Role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    res.status(200).json({
      message: `User role updated to ${role} successfully`,
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};




//Add a product

export const addProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock, imageUrl } = req.body;

    // Check if user is admin (Middleware should handle this before calling the function)
    if (!req.user?.role || req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can add products" });
    }

    // Check if product with same name exists
    const existingProduct = await prisma.product.findUnique({ where: { name } });
    if (existingProduct) {
      return res.status(400).json({ error: "Product already exists" });
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        imageUrl,
      },
    });

    res.status(201).json({ 
      message: "Product added successfully", product 
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ 
      error: "Something went wrong to add product" 
    });
  }
};




export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;

  try {
      // Find product
      const product = await prisma.product.findUnique({ where: { id } });

      if (!product) {
          return res.status(404).json({ 
            error: "Product not found" 
          });
      }

      // Update product
      const updatedProduct = await prisma.product.update({
          where: { id },
          data: { name, description, price, stock },
      });

      res.json({ 
        message: "Product updated successfully", product: updatedProduct 
      });
  } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ 
        error: "Something went wrong" 
      });
  }
};




export const getAllProducts = async (req: AuthRequest, res: Response) => {
  try {
      const products = await prisma.product.findMany();
      res.status(200).json({ products });
  } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ 
        error: "Something went wrong" 
      });
  }
};




