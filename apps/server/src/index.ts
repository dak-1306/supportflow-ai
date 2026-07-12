import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/routes/auth.route";
import { errorHandler } from "./middlewares/error.middleware";
import { connectDatabase } from "./config/database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "OK", data: { timestamp: new Date() } });
});

// Global Error Handler
app.use(errorHandler);

// Bootstrap App
const bootstrap = async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

bootstrap();
