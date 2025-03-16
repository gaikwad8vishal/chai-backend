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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOrders = exports.placeOrder = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ Place Order (using token's userId)
const placeOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Invalid order data" });
        }
        // Calculate total price
        const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        // Create order
        const order = yield prisma.order.create({
            data: {
                userId: req.userId, // Using token's userId
                totalPrice,
                items: {
                    create: items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: { items: true }, //  Include order items in response
        });
        res.status(201).json({ message: "Order placed successfully", order });
    }
    catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.placeOrder = placeOrder;
// ✅ Get User Orders
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        console.log("Fetching orders for userId:", req.userId); // ✅ Debugging log
        const orders = yield prisma.order.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: "desc" },
            include: { items: true },
        });
        if (orders.length === 0) {
            return res.json({ message: "No orders found", orders: [] });
        }
        res.json({ orders });
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Something went wrong while fetching orders" });
    }
});
exports.getUserOrders = getUserOrders;
