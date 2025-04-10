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
exports.getCityFromCoordinates = exports.profile = exports.signin = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
// Signup
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: { username, password: hashedPassword },
        });
        res.status(201).json({ message: "User registered successfully", user });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.signup = signup;
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
// Signin
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield prisma.user.findFirst({
            where: { username: username }, // ✅ Correct syntax
        });
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            role: user.role
        }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });
        res.json({ message: "Login successful", token, role: user.role });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong to signin" });
    }
});
exports.signin = signin;
// Profile
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.profile = profile;
// Get City from Coordinates
const getCityFromCoordinates = (latitude, longitude) => __awaiter(void 0, void 0, void 0, function* () {
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (isNaN(lat) || isNaN(lon)) {
        console.error("Invalid latitude or longitude");
        return "Invalid Coordinates";
    }
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
        const response = yield axios_1.default.get(url);
        if (response.data.address) {
            return response.data.address.city || response.data.address.town || response.data.address.village || "Unknown Location";
        }
        return "Unknown Location";
    }
    catch (error) {
        console.error("Error fetching city:", error);
        return "Unknown Location";
    }
});
exports.getCityFromCoordinates = getCityFromCoordinates;
