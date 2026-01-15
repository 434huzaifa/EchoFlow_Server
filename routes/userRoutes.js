import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/userController.js";
import validateRequest from "../middleware/validateRequest.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  registerSchema,
  loginSchema,
  logoutSchema,
} from "../middleware/validation.js";

const router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  asyncHandler(register)
);
router.post("/login", validateRequest(loginSchema), asyncHandler(login));
router.post(
  "/refresh",
  asyncHandler(refreshToken)
);
router.post("/logout", validateRequest(logoutSchema), asyncHandler(logout));

export default router;
