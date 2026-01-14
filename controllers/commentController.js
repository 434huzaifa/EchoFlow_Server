import commentService from '../services/commentService.js';

const createComment = async (req, res) => {
  const { text } = req.validatedData;
  const comment = await commentService.createComment(text, req.userId);
  res.status(201).json({ message: 'Comment created successfully', comment });
};

const getComments = async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'newest' } = req.query;
  const result = await commentService.getComments(parseInt(page), parseInt(limit), sortBy);
  res.json(result);
};

const getCommentById = async (req, res) => {
  const comment = await commentService.getCommentById(req.params.id);
  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }
  res.json(comment);
};

const updateComment = async (req, res) => {
  const { text } = req.validatedData;
  try {
    const comment = await commentService.updateComment(req.params.id, text, req.userId);
    res.json({ message: 'Comment updated successfully', comment });
  } catch (error) {
    if (error.message.includes('Not authorized')) {
      error.statusCode = 403;
    }
    throw error;
  }
};

const deleteComment = async (req, res) => {
  try {
    await commentService.deleteComment(req.params.id, req.userId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    if (error.message.includes('Not authorized')) {
      error.statusCode = 403;
    }
    throw error;
  }
};

const likeComment = async (req, res) => {
  const comment = await commentService.likeComment(req.params.id, req.userId);
  res.json({ message: 'Like action successful', comment });
};

const dislikeComment = async (req, res) => {
  const comment = await commentService.dislikeComment(req.params.id, req.userId);
  res.json({ message: 'Dislike action successful', comment });
};

export {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
};
