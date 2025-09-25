import express from "express";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import skincareTipRoutes from "./routes/skincareTipRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import faceAnalysisRoutes from "./routes/faceAnalysisRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import morgan from "morgan";
import cors from "cors";
dotenv.config();

connectDB();

const app = express();
const options = {
  origin: ["http://localhost:3000"],
  useSuccessStatus: true,
};

app.use(cors(options));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Increase payload size limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Additional middleware to handle large requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  next();
});

app.get("/", (req, res) => {
  res.send("API running...");
});

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/skincare-tips", skincareTipRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/face-analysis", faceAnalysisRoutes);
app.use("/api/ai", aiRoutes);


const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`listening in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
