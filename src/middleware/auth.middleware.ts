import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "USER" | "ADMIN" | "DELIVERY_PERSON";
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      error: "Unauthorized: No token provided" 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // ✅ Decode token to get userId
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { userId: string };

    // ✅ Fetch user from database
    const user = await prisma.user.findUnique({
       where: { id: decoded.userId } 
      });

    if (!user) {
      return res.status(404).json({ 
        error: "User not found" 
      });
    }

    req.user = {
      id: user.id,
      role: user.role, // "USER" | "ADMIN" | "DELIVERY_PERSON"
    };

    next();
  } catch (error) {
    return res.status(401).json({ 
      error: "Unauthorized: Invalid token" 
    });
  }
};


// ✅ Check if User is Admin
export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};



export const isDeliveryPerson = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "DELIVERY_PERSON") {
      return res.status(403).json({ 
        error: "Access denied. Only delivery persons can access this route." 
      });
  }
  next();
};
