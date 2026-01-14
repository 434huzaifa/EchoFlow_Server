import { z } from 'zod';

// User validation schemas
const registerSchema = z.object({
  Name: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .max(30, 'Name cannot exceed 30 characters')
    .trim(),
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
  post: z
    .string()
    .min(1, 'Post ID is required'),
  path: z
    .string()
    .optional()
    .nullable(),
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
  title: z
    .string()
    .min(1, 'Post title cannot be empty')
    .max(50, 'Post title cannot exceed 50 characters')
    .trim(),
  body: z
    .string()
    .min(1, 'Post body cannot be empty')
    .max(1000, 'Post body cannot exceed 1000 characters')
    .trim(),
});

const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, 'Post title cannot be empty')
    .max(50, 'Post title cannot exceed 50 characters')
    .trim()
    .optional(),
  body: z
    .string()
    .min(1, 'Post body cannot be empty')
    .max(1000, 'Post body cannot exceed 1000 characters')
    .trim()
    .optional(),
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
