import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/order.routes";
import cartRoutes from "./routes/ cart.routes";
import adminRoutes from "./routes/admin.routes";  
import deliveryRoutes from "./routes/delivery.routes";
import { authenticate, isDeliveryPerson } from "./middleware/auth.middleware";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());



app.use("/user", authRoutes);
app.use("/user", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/admin", adminRoutes);
//@ts-ignore
app.use("/delivery",authenticate,isDeliveryPerson, deliveryRoutes);




app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
