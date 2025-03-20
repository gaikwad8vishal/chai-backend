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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const _cart_routes_1 = __importDefault(require("./routes/ cart.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const delivery_routes_1 = __importDefault(require("./routes/delivery.routes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const auth_controller_1 = require("./controllers/auth.controller");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // ✅ React frontend ka origin
    credentials: true, // ✅ Cookies aur authentication allow karne ke liye
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
}));
app.use("/user", auth_routes_1.default, order_routes_1.default);
app.use("/api/cart", _cart_routes_1.default);
app.use("/admin", admin_routes_1.default);
//@ts-ignore
app.use("/delivery", auth_middleware_1.authenticate, auth_middleware_1.isDeliveryPerson, delivery_routes_1.default);
app.use(productRoutes_1.default); // 👈 Add this
//@ts-ignore
app.post("/save-location", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Request Body:", req.body); // ✅ Debugging Request Body
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and Longitude are required" });
    }
    const city = yield (0, auth_controller_1.getCityFromCoordinates)(latitude, longitude);
    res.json({ city });
}));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
