import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { AuthRequest } from "../middleware/auth.middleware";


dotenv.config();
const prisma = new PrismaClient();

//defining types for backend 


enum OrderStatus {
  PENDING = "PENDING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

// Define OrderItem interface
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// Define Order interface
interface Order {
  id: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string | Date;
  items: OrderItem[];
}

  export const makeAdmin = async (req: Request, res: Response) => {
    const { userId } = req.body;
  
    try {
  
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


//statistics

export const getOrderStats = async (req: AuthRequest, res: Response) => {
  try {
    // Check if the user is an admin
    if (!req.user?.role || req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Fetch all orders with their items
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        deliveryPerson: true, // Include delivery person details if needed
      },
    });

    // Total orders
    const totalOrders = orders.length;

    // Orders by status
    const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
    const completedOrders = orders.filter((order) => order.status === "DELIVERED").length;
    const cancelledOrders = orders.filter((order) => order.status === "CANCELLED").length;

    // Total revenue (only from DELIVERED orders)
    const totalRevenue = orders
      .filter((order) => order.status === "DELIVERED")
      .reduce((sum, order) => sum + order.totalPrice, 0);

    // Average Order Value (AOV)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Most popular products
    const popularProducts = orders.reduce((acc: Record<string, number>, order) => {
      order.items.forEach((item) => {
        if (!acc[item.name]) acc[item.name] = 0;
        acc[item.name] += item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);
    

    const sortedPopularProducts = Object.entries(popularProducts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, quantity]) => ({ name, quantity }));

    // Revenue by status
    const revenueByStatus = orders.reduce(
      (acc, order) => {
        if (!acc[order.status]) acc[order.status] = 0;
        acc[order.status] += order.totalPrice;
        return acc;
      },
      {} as Record<string, number>
    );

    // Group orders by time period (day/week/month)
    const { period = "day" } = req.query; // Default to daily stats
    const groupedData = groupOrdersByTimePeriod(orders, period as string);

    // Delivery person performance (if applicable)
    const deliveryPerformance = orders.reduce((acc, order) => {
      if (order.deliveryPerson) {
        const deliveryPersonId = order.deliveryPerson.id;
        if (!acc[deliveryPersonId]) {
          acc[deliveryPersonId] = {
            name: order.deliveryPerson.username,
            deliveredOrders: 0,
            totalRevenue: 0,
          };
        }
        if (order.status === "DELIVERED") {
          acc[deliveryPersonId].deliveredOrders++;
          acc[deliveryPersonId].totalRevenue += order.totalPrice;
        }
      }
      return acc;
    }, {} as Record<string, { name: string; deliveredOrders: number; totalRevenue: number }>);

    // Send response
    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
      popularProducts: sortedPopularProducts,
      revenueByStatus,
      groupedData,
      deliveryPerformance: Object.values(deliveryPerformance),
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Helper function to group orders by time period

export const groupOrdersByTimePeriod = (orders: any[], period: string) => {
  const grouped = {} as Record<string, { orders: number; revenue: number }>;

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    let key: string; // Explicitly declare `key` as a string

    if (period === "day") {
      key = date.toLocaleDateString(); // Group by day
    } else if (period === "week") {
      key = `${date.getFullYear()}-W${Math.ceil(
        (date.getDate() + 6 - date.getDay()) / 7
      )}`; // Group by week
    } else if (period === "month") {
      key = `${date.getFullYear()}-${date.getMonth() + 1}`; // Group by month
    } else {
      throw new Error(`Invalid period: ${period}`); // Handle invalid periods
    }

    if (!grouped[key]) grouped[key] = { orders: 0, revenue: 0 };
    grouped[key].orders++;
    grouped[key].revenue += order.totalPrice;
  });

  return grouped;
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
      const product = await prisma.product.findUnique({ 
        where: { id } 
      });

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




export const deleteProduct = async (req:AuthRequest, res:Response) => {
  try {
    const { id } = req.params;

    // 🛑 Check if product exists
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🚀 Delete the product
    await prisma.product.delete({ where: { id } });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


