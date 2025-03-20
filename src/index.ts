import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/order.routes";
import cartRoutes from "./routes/ cart.routes";
import adminRoutes from "./routes/admin.routes";  
import deliveryRoutes from "./routes/delivery.routes";
import { authenticate, isDeliveryPerson } from "./middleware/auth.middleware";
import productRoutes from "./routes/productRoutes";
import { getCityFromCoordinates } from "./controllers/auth.controller";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // ✅ React frontend ka origin
  credentials: true, // ✅ Cookies aur authentication allow karne ke liye
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
}));

app.use("/user", authRoutes, orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/admin", adminRoutes);
//@ts-ignore
app.use("/delivery",authenticate,isDeliveryPerson, deliveryRoutes);
app.use(productRoutes); // 👈 Add this

//@ts-ignore
app.post("/save-location", async (req, res) => {
  console.log("Request Body:", req.body); // ✅ Debugging Request Body

  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude and Longitude are required" });
  }

  const city = await getCityFromCoordinates(latitude, longitude);
  res.json({ city });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
