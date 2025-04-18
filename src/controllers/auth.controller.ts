import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { AuthRequest } from "../middleware/auth.middleware";
import axios from "axios";

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
      res.json({ message: "Login successful", token , role: user.role  });
    } catch (error) {
      res.status(500).json({ error: "Something went wrong to signin" });
    }
  };



// Profile
  export const profile = async (req: AuthRequest, res: Response) => {
    try {
 
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



// Get City from Coordinates
 export  const getCityFromCoordinates = async (latitude: any, longitude: any) => {



  const lat = Number(latitude);  
  const lon = Number(longitude);


  if (isNaN(lat) || isNaN(lon)) {
    console.error("Invalid latitude or longitude"); 
    return "Invalid Coordinates";
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const response = await axios.get(url);
    if (response.data.address) {
      return response.data.address.city || response.data.address.town || response.data.address.village || "Unknown Location";
    }

    return "Unknown Location";
  } catch (error) {
    console.error("Error fetching city:", error);
    return "Unknown Location";
  }
};
