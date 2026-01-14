import { z } from 'zod';

// User validation schemas
const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Please provide a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password cannot exceed 100 characters'),
});

const loginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// Comment validation schemas
const createCommentSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment cannot exceed 1000 characters')
    .trim(),
});

const updateCommentSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment cannot exceed 1000 characters')
    .trim(),
});

const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token is required'),
});

const logoutSchema = z.object({
  refreshToken: z
    .string()
    .optional(),
});

// Post validation schemas
const createPostSchema = z.object({
  comment: z
    .string()
    .min(1, 'Post comment cannot be empty')
    .max(1000, 'Post comment cannot exceed 1000 characters')
    .trim(),
});

const updatePostSchema = z.object({
  comment: z
    .string()
    .min(1, 'Post comment cannot be empty')
    .max(1000, 'Post comment cannot exceed 1000 characters')
    .trim(),
});

export {
  registerSchema,
  loginSchema,
  createCommentSchema,
  updateCommentSchema,
  refreshTokenSchema,
  logoutSchema,
  createPostSchema,
  updatePostSchema,
};
