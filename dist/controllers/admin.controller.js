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
exports.getCustomerOrders = exports.getOrderStats = exports.cancelOrder = exports.updateOrderStatus = exports.getAllOrders = exports.deleteUser = exports.toggleBlockUser = exports.getAllUsers = exports.makeAdmin = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const makeAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        console.log("Received userId:", userId);
        if (!userId) {
            return res.status(400).json({
                error: "User ID is required"
            });
        }
        //  Find user in DB
        const existingUser = yield prisma.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        if (existingUser.isAdmin) {
            return res.status(400).json({
                error: "User is already an Admin"
            });
        }
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: {
                role: "ADMIN",
                isAdmin: true,
            },
        });
        res.json({ message: `User ${updatedUser.username} is now an Admin` });
    }
    catch (error) {
        console.error("Error making admin:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.makeAdmin = makeAdmin;
// to get all users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            select: { id: true, username: true, isBlocked: true, role: true },
        });
        res.json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getAllUsers = getAllUsers;
// to block or unblock a user
const toggleBlockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Ensure that 'isBlocked' exists on user
        if (typeof user.isBlocked !== "boolean") {
            return res.status(400).json({ error: "Invalid user data" });
        }
        const updatedUser = yield prisma.user.update({
            where: { id },
            data: { isBlocked: !user.isBlocked },
        });
        res.json({ message: `User ${updatedUser.isBlocked ? "blocked" : "unblocked"} successfully` });
    }
    catch (error) {
        console.error("Error updating user block status:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.toggleBlockUser = toggleBlockUser;
// to delete a user
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.findUnique({ where: { id } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        yield prisma.user.delete({ where: { id } });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.deleteUser = deleteUser;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.isAdmin) {
            return res.status(403).json({ error: "Access denied" });
        }
        const orders = yield prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            include: { user: true, items: true },
        });
        res.json({ orders });
    }
    catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getAllOrders = getAllOrders;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    console.log("Received order ID:", id);
    const { status } = req.body;
    if (!req.isAdmin) {
        return res.status(403).json({
            error: "Access denied"
        });
    }
    try {
        const updatedOrder = yield prisma.order.update({
            where: { id },
            data: { status },
            include: { items: true },
        });
        res.json({
            message: `Order status updated to ${status}`, order: updatedOrder
        });
    }
    catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.updateOrderStatus = updateOrderStatus;
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // ✅ Find order
        const order = yield prisma.order.findUnique({
            where: { id },
        });
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        // ✅ If user is not admin, check if this order belongs to them
        if (!req.isAdmin && order.userId !== req.userId) {
            return res.status(403).json({ error: "You can only cancel your own orders" });
        }
        // ✅ Check if order is already delivered
        if (order.status === "DELIVERED") {
            return res.status(400).json({ error: "Cannot cancel a delivered order" });
        }
        // ✅ Update order status to "CANCELLED"
        const cancelledOrder = yield prisma.order.update({
            where: { id },
            data: { status: "CANCELLED" },
        });
        res.json({ message: "Order cancelled successfully", order: cancelledOrder });
    }
    catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.cancelOrder = cancelOrder;
const getOrderStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.isAdmin) {
            return res.status(403).json({ error: "Access denied" });
        }
        const totalOrders = yield prisma.order.count();
        const pendingOrders = yield prisma.order.count({ where: { status: "PENDING" } });
        const completedOrders = yield prisma.order.count({ where: { status: "DELIVERED" } });
        const cancelledOrders = yield prisma.order.count({ where: { status: "CANCELLED" } });
        const totalRevenue = yield prisma.order.aggregate({
            _sum: { totalPrice: true },
            where: { status: "DELIVERED" },
        });
        res.json({
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue: totalRevenue._sum.totalPrice || 0,
        });
    }
    catch (error) {
        console.error("Error fetching order stats:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getOrderStats = getOrderStats;
const getCustomerOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        if (!req.isAdmin) {
            return res.status(403).json({ error: "Access denied" });
        }
        const orders = yield prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { items: true },
        });
        if (!orders.length) {
            return res.status(404).json({ error: "No orders found for this user" });
        }
        res.json({ userId, orders });
    }
    catch (error) {
        console.error("Error fetching customer orders:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getCustomerOrders = getCustomerOrders;
