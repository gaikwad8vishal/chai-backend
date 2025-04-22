import { Router } from "express";
import { signup, signin, getCityFromCoordinates } from "../controllers/auth.controller";
import { profile } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import jwt from "jsonwebtoken";
import prisma from "../config/db";


const router = Router();

router.post("/signup", signup);
// @ts-ignore
router.post("/signin", signin);
// @ts-ignore
router.get("/profile", authenticate, profile);
//@ts-ignore



router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, isAdmin: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
});


export default router;
