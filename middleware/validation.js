import { z } from 'zod';

const registerSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .max(15, 'Name cannot exceed 15 characters')
    .trim(),
  email: z
    .string()
    .email('Please provide a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(6, 'Password cannot exceed 6 characters'),
});

const loginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

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


const logoutSchema = z.object({
  refreshToken: z
    .string()
    .optional(),
});

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

const postIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid post ID format'),
});

export {
  registerSchema,
  loginSchema,
  createCommentSchema,
  updateCommentSchema,
  logoutSchema,
  createPostSchema,
  updatePostSchema,
  postIdParamSchema,
};
