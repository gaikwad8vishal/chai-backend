import { Router } from "express";
import { signup, signin } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
// @ts-ignore
router.post("/signin", signin);

export default router;
