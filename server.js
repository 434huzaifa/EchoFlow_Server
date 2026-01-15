import "dotenv/config.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/database.js";
import commentRoutes from "./routes/commentRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { attachRouter } from "./common/utility.js";
import initializeSocket from "./socket/socketHandler.js";

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked this request"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

morgan.token("timestamp", () => new Date().toISOString());

const morganFormat = ":timestamp | :method :url | :status | :response-time ms";
app.use(morgan(morganFormat));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
});

initializeSocket(io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

const appRoutes = [
  {
    prefix: "/api/users",
    router: userRoutes,
  },
  {
    prefix: "/api/posts",
    router: postRoutes,
  },
  {
    prefix: "/api/comments",
    router: commentRoutes,
  },
];

attachRouter(app, appRoutes);

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

// Global error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === "development";

  console.error("\n=> ERROR TRACE:");
  console.error(`Status: ${statusCode}`);
  console.error(`Message: ${err.message}`);
  console.error(`Timestamp: ${new Date().toISOString()}`);
  console.error("Stack:");
  console.error(err.stack);
  console.error("\n");

  const errorResponse = {
    message: err.message || "Something went wrong. Please try again later.",
    ...(isDevelopment && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 EchoFlow Server started on port ${PORT}`);
  console.log(`🔌 Socket.io initialized on port ${PORT}`);
});
