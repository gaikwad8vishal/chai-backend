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
exports.updateOrderDeliveryStatus = exports.getMyAssignedOrders = exports.getAssignedOrders = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAssignedOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const deliveryPersonId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const orders = yield prisma.order.findMany({
            where: { assignedTo: deliveryPersonId },
            include: { user: true, items: true }
        });
        if (!orders.length) {
            return res.status(404).json({ error: "No assigned orders found" });
        }
        res.json({ orders });
    }
    catch (error) {
        console.error("Error fetching assigned orders:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getAssignedOrders = getAssignedOrders;
const getMyAssignedOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "DELIVERY_PERSON") {
            return res.status(403).json({
                error: "Access denied"
            });
        }
        const orders = yield prisma.order.findMany({
            where: {
                assignedTo: req.user.id,
                status: { in: ["ASSIGNED", "OUT_FOR_DELIVERY"] }
            },
            include: { items: true, user: { select: { username: true } } },
        });
        res.json({ orders });
    }
    catch (error) {
        console.error("Error fetching assigned orders:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getMyAssignedOrders = getMyAssignedOrders;
const updateOrderDeliveryStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { orderId, status } = req.body;
    try {
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "DELIVERY_PERSON") {
            return res.status(403).json({ error: "Access denied" });
        }
        const order = yield prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        if (order.assignedTo !== req.user.id) {
            return res.status(403).json({ error: "You can update only your assigned orders" });
        }
        if (!["OUT_FOR_DELIVERY", "DELIVERED"].includes(status)) {
            return res.status(400).json({ error: "Invalid status update" });
        }
        const updatedOrder = yield prisma.order.update({
            where: { id: orderId },
            data: { status },
        });
        res.json({ message: `Order updated to ${status}`, order: updatedOrder });
    }
    catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.updateOrderDeliveryStatus = updateOrderDeliveryStatus;
