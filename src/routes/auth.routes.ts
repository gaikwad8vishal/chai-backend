import { Router } from "express";
import { signup, signin, getCityFromCoordinates } from "../controllers/auth.controller";
import { profile } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);
// @ts-ignore
router.post("/signin", signin);
// @ts-ignore
router.get("/profile", authenticate, profile);
//@ts-ignore
export default router;
