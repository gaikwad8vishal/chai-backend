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
exports.clearCart = exports.removeCartItem = exports.getCartItems = exports.addToCart = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ Add item to cart
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, quantity, price } = req.body;
        if (!req.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        let cart = yield prisma.cart.findUnique({
            where: { userId: req.userId }
        });
        if (!cart) {
            cart = yield prisma.cart.create({
                data: { userId: req.userId }
            });
        }
        const cartItem = yield prisma.cartItem.create({
            data: {
                cartId: cart.id,
                name,
                quantity,
                price,
            },
        });
        res.json({ message: "Item added to cart", cartItem });
    }
    catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.addToCart = addToCart;
// ✅ Get user cart items
const getCartItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const cart = yield prisma.cart.findUnique({
            where: { userId: req.userId },
            include: { items: true },
        });
        res.json((cart === null || cart === void 0 ? void 0 : cart.items) || []);
    }
    catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getCartItems = getCartItems;
// ✅ Remove item from cart
const removeCartItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId } = req.params;
        yield prisma.cartItem.delete({ where: { id: itemId } });
        res.json({ message: "Item removed from cart" });
    }
    catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.removeCartItem = removeCartItem;
// ✅ Clear cart after checkout
const clearCart = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.cartItem.deleteMany({
        where: { cart: { userId } },
    });
});
exports.clearCart = clearCart;
