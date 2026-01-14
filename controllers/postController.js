import postService from '../services/postService.js';

const createPost = async (req, res) => {
  const { title, body } = req.validatedData;
  const post = await postService.createPost(title, body, req.userId);
  res.status(201).json({ message: 'Post created successfully', post });
};

const getPosts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await postService.getPosts(parseInt(page), parseInt(limit));
  res.json(result);
};

const getPostById = async (req, res) => {
  const post = await postService.getPostById(req.params.id);
  if (!post) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }
  res.json(post);
};

const updatePost = async (req, res) => {
  const { title, body } = req.validatedData;
  try {
    const post = await postService.updatePost(req.params.id, { title, body }, req.userId);
    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    if (error.message.includes('Not authorized')) {
      error.statusCode = 403;
    }
    throw error;
  }
};

const deletePost = async (req, res) => {
  try {
    await postService.deletePost(req.params.id, req.userId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    if (error.message.includes('Not authorized')) {
      error.statusCode = 403;
    }
    throw error;
  }
};

export {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};
