import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { AuthRequest } from "../middleware/auth.middleware";


// Signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};




dotenv.config();
const prisma = new PrismaClient();

// Signin
export const signin = async (req: Request, res: Response) => {
    try {
      const { username , password } = req.body;
      const user = await prisma.user.findFirst({
        where: { username: username }, // ✅ Correct syntax
      });
      
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      const token = jwt.sign({ 
        userId: user.id ,  
        role: user.role  

      }, 
      process.env.SECRET_KEY!, {
        expiresIn: "1d",
      });
      console.log("role:", user.role);
      res.json({ message: "Login successful", token , role: user.role  });
    } catch (error) {
      res.status(500).json({ error: "Something went wrong to signin" });
    }
  };



// Profile
  export const profile = async (req: AuthRequest, res: Response) => {
    try {
       console.log("User from token:", req.user); // Debugging
 
       if (!req.user) {
          return res.status(401).json({ error: "Unauthorized" });
       }
 
       const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { id: true, username: true },
       });
 
       if (!user) {
          return res.status(404).json({ error: "User not found" });
       }
 
       res.json(user);
    } catch (error) {
       console.error("Error fetching profile:", error);
       res.status(500).json({ error: "Something went wrong" });
    }
 };
 