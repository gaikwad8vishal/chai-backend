"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const order_controller_1 = require("../controllers/order.controller");
const router = express_1.default.Router();
// ✅ Only admins can access this route
//@ts-ignore
router.get("/dashboard", auth_middleware_1.authenticate, auth_middleware_1.isAdmin, (req, res) => {
    res.json({
        message: "Welcome to Admin Dashboard"
    });
});
//@ts-ignore
router.post("/make-admin", auth_middleware_1.authenticate, admin_controller_1.makeAdmin);
//@ts-ignore
router.get("/users", auth_middleware_1.authenticate, admin_controller_1.getAllUsers); // ✅ Get all users
//@ts-ignore
router.patch("/users/block-unblock:id", auth_middleware_1.authenticate, admin_controller_1.toggleBlockUser); // ✅ Block/Unblock User
//@ts-ignore
router.delete("/users/:id", auth_middleware_1.authenticate, admin_controller_1.deleteUser); // ✅ Delete User
// ✅ Admin can view all orders
//@ts-ignore
router.get("/all-orders", auth_middleware_1.authenticate, (req, res, next) => {
    //@ts-ignore
    if (!req.isAdmin)
        return res.status(403).json({
            error: "Forbidden: Admins only"
        });
    next();
}, admin_controller_1.getAllOrders);
//@ts-ignore
// ✅ Admin can update order status
router.put("/update-status", auth_middleware_1.authenticate, (req, res, next) => {
    //@ts-ignore
    if (!req.isAdmin)
        return res.status(403).json({
            error: "Forbidden: Admins only"
        });
    next();
}, admin_controller_1.updateOrderStatus);
//@ts-ignore
// ✅ Admin can cancel order
router.put("/cancel/:id", auth_middleware_1.authenticate, admin_controller_1.cancelOrder);
// 🔹 Order Statistics Route
//@ts-ignore
router.get("/order-stats", auth_middleware_1.authenticate, admin_controller_1.getOrderStats);
// 🔹 Specific Customer Order History
//@ts-ignore
router.get("/orders/:userId", auth_middleware_1.authenticate, admin_controller_1.getCustomerOrders);
// 🔹 Assign Delivery Person
//@ts-ignore
router.post("/assign-delivery", auth_middleware_1.authenticate, order_controller_1.assignDeliveryPerson);
//@ts-ignore
router.put("/update-role/:userId", auth_middleware_1.authenticate, admin_controller_1.updateUserRole);
//@ts-ignore
// ✅ Admin can add a product
router.post("/add-product", auth_middleware_1.authenticate, admin_controller_1.addProduct);
//@ts-ignore
// ✅ Admin can update a product
router.put("/update-product/:id", auth_middleware_1.authenticate, admin_controller_1.updateProduct);
//@ts-ignore
// ✅ Admin can view all products
router.get("/all-products", auth_middleware_1.authenticate, admin_controller_1.getAllProducts);
exports.default = router;
