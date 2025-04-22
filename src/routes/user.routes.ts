import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import prisma from "../config/db";

const router = express.Router();

// Signup endpoint (USER role only)
router.post(
  "/signup",
  [
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req:any, res:any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if username exists
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: "USER",
          isAdmin: false,
        },
        select: { id: true, username: true, role: true },
      });

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY!, {
        expiresIn: "1h",
      });

      return res.json({ token, role: user.role });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

// Signin endpoint (all roles)
router.post(
  "/signin",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req:any, res:any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true, username: true, password: true, role: true },
      });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY!, {
        expiresIn: "1h",
      });

      return res.json({ token, role: user.role });
    } catch (error) {
      console.error("Signin error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;