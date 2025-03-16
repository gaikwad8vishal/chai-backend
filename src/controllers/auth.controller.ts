import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";


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
  
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY!, {
        expiresIn: "1d",
      });
  
      res.json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ error: "Something went wrong to signin" });
    }
  };
  