import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/order.routes";

import {cartRoutes} from "./routes/cart.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());



app.use("/user", authRoutes);
app.use("/user", orderRoutes);
app.use("/api", cartRoutes);



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
