"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_controller_2 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/signup", auth_controller_1.signup);
// @ts-ignore
router.post("/signin", auth_controller_1.signin);
// @ts-ignore
router.get("/profile", auth_middleware_1.authenticate, auth_controller_2.profile);
//@ts-ignore
exports.default = router;
