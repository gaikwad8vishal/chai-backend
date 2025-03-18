"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDeliveryPerson = exports.isAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Unauthorized: No token provided"
        });
    }
    const token = authHeader.split(" ")[1];
    try {
        // ✅ Decode token to get userId
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        // ✅ Fetch user from database
        const user = yield prisma.user.findUnique({
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
    }
    catch (error) {
        return res.status(401).json({
            error: "Unauthorized: Invalid token"
        });
    }
});
exports.authenticate = authenticate;
// ✅ Check if User is Admin
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const user = yield prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }
        next();
    }
    catch (error) {
        console.error("Error checking admin status:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.isAdmin = isAdmin;
const isDeliveryPerson = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "DELIVERY_PERSON") {
        return res.status(403).json({
            error: "Access denied. Only delivery persons can access this route."
        });
    }
    next();
};
exports.isDeliveryPerson = isDeliveryPerson;
