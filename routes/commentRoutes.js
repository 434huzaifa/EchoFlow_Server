import express from "express";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../middleware/validation.js";
import {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createCommentSchema),
  asyncHandler(createComment)
);
router.get("/", optionalAuth, asyncHandler(getComments));
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
export default router;
