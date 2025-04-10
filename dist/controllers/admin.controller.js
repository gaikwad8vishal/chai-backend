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
exports.deleteProduct = exports.getAllProducts = exports.updateProduct = exports.addProduct = exports.updateUserRole = exports.getCustomerOrders = exports.groupOrdersByTimePeriod = exports.getOrderStats = exports.cancelOrder = exports.updateOrderStatus = exports.getAllOrders = exports.deleteUser = exports.toggleBlockUser = exports.getAllUsers = exports.makeAdmin = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
//defining types for backend 
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (OrderStatus = {}));
const makeAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
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
        const user = yield prisma.user.findUnique({
            where: { id }
        });
        if (!user)
            return res.status(404).json({
                error: "User not found"
            });
        yield prisma.user.delete({ where: { id } });
        res.json({
            message: "User deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            error: "Something went wrong"
        });
    }
});
exports.deleteUser = deleteUser;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "ADMIN") {
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
        res.status(500).json({
            error: "Something went wrong"
        });
    }
});
exports.getAllOrders = getAllOrders;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.body;
    const { status } = req.body;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || req.user.role !== "ADMIN") {
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
    var _a;
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
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || (req.user.role !== "ADMIN" && order.userId !== req.user.id)) {
            return res.status(403).json({
                error: "You can only cancel your own orders"
            });
        }
        // ✅ Check if order is already delivered
        if (order.status === "DELIVERED") {
            return res.status(400).json({
                error: "Cannot cancel a delivered order"
            });
        }
        // ✅ Update order status to "CANCELLED"
        const cancelledOrder = yield prisma.order.update({
            where: { id },
            data: { status: "CANCELLED" },
        });
        res.json({
            message: "Order cancelled successfully", order: cancelledOrder
        });
    }
    catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.cancelOrder = cancelOrder;
//statistics
const getOrderStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if the user is an admin
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Access denied" });
        }
        // Fetch all orders with their items
        const orders = yield prisma.order.findMany({
            include: {
                items: true,
                deliveryPerson: true, // Include delivery person details if needed
            },
        });
        // Total orders
        const totalOrders = orders.length;
        // Orders by status
        const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
        const completedOrders = orders.filter((order) => order.status === "DELIVERED").length;
        const cancelledOrders = orders.filter((order) => order.status === "CANCELLED").length;
        // Total revenue (only from DELIVERED orders)
        const totalRevenue = orders
            .filter((order) => order.status === "DELIVERED")
            .reduce((sum, order) => sum + order.totalPrice, 0);
        // Average Order Value (AOV)
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        // Most popular products
        const popularProducts = orders.reduce((acc, order) => {
            order.items.forEach((item) => {
                if (!acc[item.name])
                    acc[item.name] = 0;
                acc[item.name] += item.quantity;
            });
            return acc;
        }, {});
        const sortedPopularProducts = Object.entries(popularProducts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, quantity]) => ({ name, quantity }));
        // Revenue by status
        const revenueByStatus = orders.reduce((acc, order) => {
            if (!acc[order.status])
                acc[order.status] = 0;
            acc[order.status] += order.totalPrice;
            return acc;
        }, {});
        // Group orders by time period (day/week/month)
        const { period = "day" } = req.query; // Default to daily stats
        const groupedData = (0, exports.groupOrdersByTimePeriod)(orders, period);
        // Delivery person performance (if applicable)
        const deliveryPerformance = orders.reduce((acc, order) => {
            if (order.deliveryPerson) {
                const deliveryPersonId = order.deliveryPerson.id;
                if (!acc[deliveryPersonId]) {
                    acc[deliveryPersonId] = {
                        name: order.deliveryPerson.username,
                        deliveredOrders: 0,
                        totalRevenue: 0,
                    };
                }
                if (order.status === "DELIVERED") {
                    acc[deliveryPersonId].deliveredOrders++;
                    acc[deliveryPersonId].totalRevenue += order.totalPrice;
                }
            }
            return acc;
        }, {});
        // Send response
        res.json({
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue,
            averageOrderValue,
            popularProducts: sortedPopularProducts,
            revenueByStatus,
            groupedData,
            deliveryPerformance: Object.values(deliveryPerformance),
        });
    }
    catch (error) {
        console.error("Error fetching order stats:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getOrderStats = getOrderStats;
// Helper function to group orders by time period
const groupOrdersByTimePeriod = (orders, period) => {
    const grouped = {};
    orders.forEach((order) => {
        const date = new Date(order.createdAt);
        let key; // Explicitly declare `key` as a string
        if (period === "day") {
            key = date.toLocaleDateString(); // Group by day
        }
        else if (period === "week") {
            key = `${date.getFullYear()}-W${Math.ceil((date.getDate() + 6 - date.getDay()) / 7)}`; // Group by week
        }
        else if (period === "month") {
            key = `${date.getFullYear()}-${date.getMonth() + 1}`; // Group by month
        }
        else {
            throw new Error(`Invalid period: ${period}`); // Handle invalid periods
        }
        if (!grouped[key])
            grouped[key] = { orders: 0, revenue: 0 };
        grouped[key].orders++;
        grouped[key].revenue += order.totalPrice;
    });
    return grouped;
};
exports.groupOrdersByTimePeriod = groupOrdersByTimePeriod;
const getCustomerOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.params;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || (req.user.role !== "ADMIN" && req.user.id !== userId)) {
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
// update role of a user 
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ✅ Admin Check
        if (!req.user || req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Only admin can update user roles" });
        }
        const { userId } = req.params; // User ID from URL params
        const { role } = req.body; // New role from request body
        // ✅ Validate Role
        const validRoles = ["USER", "DELIVERY_PERSON", "ADMIN"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role provided" });
        }
        // ✅ Find Existing User
        const existingUser = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }
        // ✅ If User is Already the Given Role, No Need to Update
        if (existingUser.role === role) {
            return res.status(400).json({ error: `User is already a ${role}` });
        }
        // ✅ Update User Role
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: { role },
        });
        res.status(200).json({
            message: `User role updated to ${role} successfully`,
            updatedUser,
        });
    }
    catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.updateUserRole = updateUserRole;
//Add a product
const addProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description, price, stock, imageUrl } = req.body;
        // Check if user is admin (Middleware should handle this before calling the function)
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Only admins can add products" });
        }
        // Check if product with same name exists
        const existingProduct = yield prisma.product.findUnique({ where: { name } });
        if (existingProduct) {
            return res.status(400).json({ error: "Product already exists" });
        }
        // Create the product
        const product = yield prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                imageUrl,
            },
        });
        res.status(201).json({
            message: "Product added successfully", product
        });
    }
    catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({
            error: "Something went wrong to add product"
        });
    }
});
exports.addProduct = addProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    try {
        // Find product
        const product = yield prisma.product.findUnique({
            where: { id }
        });
        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            });
        }
        // Update product
        const updatedProduct = yield prisma.product.update({
            where: { id },
            data: { name, description, price, stock },
        });
        res.json({
            message: "Product updated successfully", product: updatedProduct
        });
    }
    catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            error: "Something went wrong"
        });
    }
});
exports.updateProduct = updateProduct;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield prisma.product.findMany();
        res.status(200).json({ products });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            error: "Something went wrong"
        });
    }
});
exports.getAllProducts = getAllProducts;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // 🛑 Check if product exists
        const existingProduct = yield prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        // 🚀 Delete the product
        yield prisma.product.delete({ where: { id } });
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteProduct = deleteProduct;
