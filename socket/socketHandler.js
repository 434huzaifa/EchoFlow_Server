import jwt from "jsonwebtoken";
import { handleFetchPosts } from "./postSocketController.js";

const initializeSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("No authorization token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      console.error("Socket authorization error:", error.message);
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id} | User ID: ${socket.userId}`);

    socket.on("FETCH_POSTS_REQUEST", (payload, callback) => {
      handleFetchPosts(socket, payload, callback);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default initializeSocket;
