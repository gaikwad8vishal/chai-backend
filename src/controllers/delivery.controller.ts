import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

export const getAssignedOrders = async (req: AuthRequest, res: Response) => {
    try {
        const deliveryPersonId = req.user?.id;

        const orders = await prisma.order.findMany({
            where: { assignedTo: deliveryPersonId },
            include: { user: true, items: true }
        });

        if (!orders.length) {
            return res.status(404).json({ error: "No assigned orders found" });
        }

        res.json({ orders });
    } catch (error) {
        console.error("Error fetching assigned orders:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};


export const getMyAssignedOrders = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== "DELIVERY_PERSON") {
            return res.status(403).json({ 
                error: "Access denied" 
            });
        }

        const orders = await prisma.order.findMany({
            where: {
                assignedTo: req.user.id, 
                status: { in: ["ASSIGNED", "OUT_FOR_DELIVERY"] } 
            },
            include: { items: true, user: { select: { username: true } } },
        });

        res.json({ orders });
    } catch (error) {
        console.error("Error fetching assigned orders:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};


export const updateOrderDeliveryStatus = async (req: AuthRequest, res: Response) => {
    const { orderId, status } = req.body;

    try {
        if (req.user?.role !== "DELIVERY_PERSON") {
            return res.status(403).json({ error: "Access denied" });
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.assignedTo !== req.user.id) {
            return res.status(403).json({ error: "You can update only your assigned orders" });
        }

        if (!["OUT_FOR_DELIVERY", "DELIVERED"].includes(status)) {
            return res.status(400).json({ error: "Invalid status update" });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status },
        });

        res.json({ message: `Order updated to ${status}`, order: updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};
