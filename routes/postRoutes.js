import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import validateRequest, { validateParams } from "../middleware/validateRequest.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  createPostSchema,
  updatePostSchema,
  postIdParamSchema,
} from "../middleware/validation.js";
import {
  createPost,
  updatePost,
  deletePost,
  likePost,
  dislikePost,
} from "../controllers/postController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createPostSchema),
  asyncHandler(createPost)
);

router.put(
  "/:id",
  authMiddleware,
  validateParams(postIdParamSchema),
  validateRequest(updatePostSchema),
  asyncHandler(updatePost)
);
router.delete(
  "/:id",
  authMiddleware,
  validateParams(postIdParamSchema),
  asyncHandler(deletePost)
);

router.post(
  "/:id/like",
  authMiddleware,
  validateParams(postIdParamSchema),
  asyncHandler(likePost)
);
router.post(
  "/:id/dislike",
  authMiddleware,
  validateParams(postIdParamSchema),
  asyncHandler(dislikePost)
);

export default router;
