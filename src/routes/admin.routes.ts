import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.middleware";
import { addProduct, cancelOrder, deleteUser, getAllOrders, getAllProducts, getAllUsers, getCustomerOrders, getOrderStats, makeAdmin, toggleBlockUser, updateOrderStatus, updateProduct, updateUserRole } from "../controllers/admin.controller";
import { get } from "http";
import { assignDeliveryPerson } from "../controllers/order.controller";

const router = express.Router();

// ✅ Only admins can access this route
//@ts-ignore
router.get("/dashboard", authenticate, isAdmin, (req, res) => {
  res.json({ 
    message: "Welcome to Admin Dashboard" 
});
});

//@ts-ignore
router.post("/make-admin", authenticate, makeAdmin);
//@ts-ignore
router.get("/users", authenticate,  getAllUsers); // ✅ Get all users
//@ts-ignore
router.patch("/users/block-unblock:id", authenticate, toggleBlockUser); // ✅ Block/Unblock User
//@ts-ignore
router.delete("/users/:id", authenticate,  deleteUser); // ✅ Delete User



// ✅ Admin can view all orders
//@ts-ignore

router.get("/all-orders", authenticate, (req, res, next) => {
    //@ts-ignore
    if (!req.isAdmin) return res.status(403).json({ 
        error: "Forbidden: Admins only" 
    });
    next();
  }, getAllOrders);


    //@ts-ignore
  // ✅ Admin can update order status
router.put("/update-status", authenticate, (req, res, next) => {
    //@ts-ignore
    if (!req.isAdmin) return res.status(403).json({ 
        error: "Forbidden: Admins only" 
        });
    next();
  }, updateOrderStatus);


  //@ts-ignore
    // ✅ Admin can cancel order
  router.put("/cancel/:id", authenticate, cancelOrder);


  // 🔹 Order Statistics Route
  //@ts-ignore
router.get("/order-stats", authenticate, getOrderStats);

// 🔹 Specific Customer Order History
//@ts-ignore
router.get("/orders/:userId", authenticate, getCustomerOrders);

// 🔹 Assign Delivery Person
//@ts-ignore
router.post("/assign-delivery", authenticate, assignDeliveryPerson);

//@ts-ignore
router.put("/update-role/:userId", authenticate ,updateUserRole);

//@ts-ignore
// ✅ Admin can add a product
router.post("/add-product", authenticate,  addProduct);

//@ts-ignore
// ✅ Admin can update a product
router.put("/update-product/:id", authenticate, updateProduct);


//@ts-ignore
// ✅ Admin can view all products
router.get("/all-products", authenticate, getAllProducts);


export default router;




