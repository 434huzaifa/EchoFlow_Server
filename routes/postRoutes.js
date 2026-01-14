import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import validateRequest from "../middleware/validateRequest.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  createPostSchema,
  updatePostSchema,
} from "../middleware/validation.js";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createPostSchema),
  asyncHandler(createPost)
);
router.get("/", asyncHandler(getPosts));
router.get("/:id", asyncHandler(getPostById));
router.put(
  "/:id",
  authMiddleware,
  validateRequest(updatePostSchema),
  asyncHandler(updatePost)
);
router.delete("/:id", authMiddleware, asyncHandler(deletePost));

export default router;
