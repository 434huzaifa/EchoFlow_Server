import express from "express";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  createCommentSchema,
  updateCommentSchema,
  createReplySchema,
  updateReplySchema,
} from "../middleware/validation.js";
import {
  createComment,
  getComments,
  getCommentsByPostId,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
  createReply,
  updateReply,
  deleteReply,
  likeReply,
  dislikeReply,
} from "../controllers/commentController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createCommentSchema),
  asyncHandler(createComment)
);

router.get("/", optionalAuth, asyncHandler(getComments));

router.get("/post/:postId", optionalAuth, asyncHandler(getCommentsByPostId));

router.get("/:id", asyncHandler(getCommentById));

router.put(
  "/:id",
  authMiddleware,
  validateRequest(updateCommentSchema),
  asyncHandler(updateComment)
);

router.delete("/:id", authMiddleware, asyncHandler(deleteComment));

router.post("/:id/like", authMiddleware, asyncHandler(likeComment));

router.post("/:id/dislike", authMiddleware, asyncHandler(dislikeComment));

// Reply routes
router.post(
  "/:commentId/replies",
  authMiddleware,
  validateRequest(createReplySchema),
  asyncHandler(createReply)
);

router.put(
  "/replies/:replyId",
  authMiddleware,
  validateRequest(updateReplySchema),
  asyncHandler(updateReply)
);

router.delete("/replies/:replyId", authMiddleware, asyncHandler(deleteReply));

router.post("/replies/:replyId/like", authMiddleware, asyncHandler(likeReply));

router.post(
  "/replies/:replyId/dislike",
  authMiddleware,
  asyncHandler(dislikeReply)
);

export default router;
