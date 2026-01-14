import 'dotenv/config.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';

import connectDB from './config/database.js';
import commentRoutes from './routes/commentRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middleware
app.use(cors());

// Custom Morgan logging format: timestamp - method path - statusCode - responseTime
morgan.token("timestamp", () => new Date().toISOString());

const morganFormat = ":timestamp | :method :url | :status | :response-time ms";
app.use(morgan(morganFormat));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

// Health check route
app.get("/health", (req, res) => {
  const mongoConnection =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "ok",
    mongodb: mongoConnection,
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === "development";

  // Print detailed error trace to terminal
  console.error("\n❌ ERROR TRACE:");
  console.error(`Status: ${statusCode}`);
  console.error(`Message: ${err.message}`);
  console.error(`Timestamp: ${new Date().toISOString()}`);
  console.error("Stack:");
  console.error(err.stack);
  console.error("\n");

  // Send error response to client
  const errorResponse = {
    message: err.message || "Something went wrong. Please try again later.",
    ...(isDevelopment && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EchoFlow Server started on port ${PORT}`);
});
