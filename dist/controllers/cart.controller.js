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
    var _a;
    try {
        const { name, quantity, price } = req.body;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        // Find or create the cart
        let cart = yield prisma.cart.findUnique({
            where: { userId: req.user.id },
        });
        if (!cart) {
            cart = yield prisma.cart.create({
                data: { userId: req.user.id }
            });
        }
        // Check if the item already exists in the cart
        const existingCartItem = yield prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                name: name, // Matching item by name
            },
        });
        let cartItem;
        if (existingCartItem) {
            // If item exists, update quantity
            cartItem = yield prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + quantity }
            });
        }
        else {
            // If item doesn't exist, create new one
            cartItem = yield prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    name,
                    quantity,
                    price,
                },
            });
        }
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
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        const cart = yield prisma.cart.findUnique({
            where: { userId: req.user.id },
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
        console.log("Received itemId:", itemId);
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
