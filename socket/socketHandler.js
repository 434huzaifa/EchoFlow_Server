import jwt from "jsonwebtoken";
import { handleFetchPosts } from "./postSocketController.js";
import { handleFetchComments, handleFetchCommentReplies } from "./commentSocketController.js";

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
    console.log(`=> User connected: ${socket.id} | User ID: ${socket.userId}`);

    // Post events
    socket.on("FETCH_POSTS_REQUEST", (payload, callback) => {
      handleFetchPosts(socket, payload, callback);
    });

    // Comment events
    socket.on("FETCH_COMMENTS_REQUEST", (payload, callback) => {
      handleFetchComments(socket, payload, callback);
    });

    socket.on("FETCH_COMMENT_REPLIES_REQUEST", (payload, callback) => {
      handleFetchCommentReplies(socket, payload, callback);
    });

    // Listen for comment broadcasts from other clients
    socket.on("NEW_COMMENT_BROADCAST", (data) => {
      socket.broadcast.emit("NEW_COMMENT_BROADCAST", data);
    });

    socket.on("COMMENT_UPDATE_BROADCAST", (data) => {
      socket.broadcast.emit("COMMENT_UPDATE_BROADCAST", data);
    });

    socket.on("COMMENT_DELETE_BROADCAST", (data) => {
      socket.broadcast.emit("COMMENT_DELETE_BROADCAST", data);
    });

    socket.on("COMMENT_LIKE_BROADCAST", (data) => {
      socket.broadcast.emit("COMMENT_LIKE_BROADCAST", data);
    });

    socket.on("COMMENT_DISLIKE_BROADCAST", (data) => {
      socket.broadcast.emit("COMMENT_DISLIKE_BROADCAST", data);
    });

    socket.on("NEW_REPLY_BROADCAST", (data) => {
      socket.broadcast.emit("NEW_REPLY_BROADCAST", data);
    });

    socket.on("REPLY_UPDATE_BROADCAST", (data) => {
      socket.broadcast.emit("REPLY_UPDATE_BROADCAST", data);
    });

    socket.on("REPLY_DELETE_BROADCAST", (data) => {
      socket.broadcast.emit("REPLY_DELETE_BROADCAST", data);
    });

    socket.on("REPLY_LIKE_BROADCAST", (data) => {
      socket.broadcast.emit("REPLY_LIKE_BROADCAST", data);
    });

    socket.on("REPLY_DISLIKE_BROADCAST", (data) => {
      socket.broadcast.emit("REPLY_DISLIKE_BROADCAST", data);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default initializeSocket;
