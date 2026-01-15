import commentService from '../services/commentService.js';
import { formatResponse } from '../common/helpers.js';

// format comment with reply data
const formatCommentWithReplies = (comment, userId, replies = []) => {
  const formattedReplies = replies.map((r) => formatResponse(r, userId));
  return formatResponse(comment, userId, { replies: formattedReplies });
};

const createComment = async (req, res) => {
  const { text, post, path } = req.validatedData;
  const comment = await commentService.createComment(text, req.userId, post, path);
  const populatedComment = await comment.populate('author', 'name email');
  const formattedComment = formatResponse(populatedComment, req.userId);
  
  req.io.emit('NEW_COMMENT_BROADCAST', { status: 'ok', data: formattedComment });
  res.status(201).json({ message: 'Comment created successfully', comment: formattedComment });
};

const getComments = async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'newest' } = req.query;
  const result = await commentService.getComments(parseInt(page), parseInt(limit), sortBy);
  res.json(result);
};

const getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;
  const { sortBy = 'newest' } = req.query;
  
  const comments = await commentService.getCommentsByPostId(postId, sortBy);
  res.json({ status: 'ok', data: comments });
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
    const populatedComment = await comment.populate('author', 'name email');
    const formattedComment = formatResponse(populatedComment, req.userId);
    
    req.io.emit('COMMENT_UPDATE_BROADCAST', { status: 'ok', data: formattedComment });
    res.json({ message: 'Comment updated successfully', comment: formattedComment });
  } catch (error) {
    if (error.message.includes('Not authorized')) error.statusCode = 403;
    throw error;
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const result = await commentService.deleteComment(commentId, req.userId);
    
    req.io.emit('COMMENT_DELETE_BROADCAST', {
      status: 'ok',
      data: { commentId, replyCount: result.replyCount },
    });
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    if (error.message.includes('Not authorized')) error.statusCode = 403;
    throw error;
  }
};

const likeComment = async (req, res) => {
  try {
    const comment = await commentService.likeComment(req.params.id, req.userId);
    const populatedComment = await comment.populate('author', 'name email');
    const isNowLiked = comment.likes?.some((id) => id.toString() === req.userId.toString());
    const formattedComment = formatResponse(populatedComment, req.userId);

    req.io.emit('COMMENT_LIKE_BROADCAST', {
      status: 'ok',
      message: isNowLiked ? 'Comment liked' : 'Like removed',
      data: formattedComment,
    });

    res.json({
      message: isNowLiked ? 'Comment liked successfully' : 'Like removed successfully',
      comment: formattedComment,
    });
  } catch (error) {
    if (error.message === 'Comment not found') error.statusCode = 404;
    throw error;
  }
};

const dislikeComment = async (req, res) => {
  try {
    const comment = await commentService.dislikeComment(req.params.id, req.userId);
    const populatedComment = await comment.populate('author', 'name email');
    const isNowDisliked = comment.dislikes?.some((id) => id.toString() === req.userId.toString());
    const formattedComment = formatResponse(populatedComment, req.userId);

    req.io.emit('COMMENT_DISLIKE_BROADCAST', {
      status: 'ok',
      message: isNowDisliked ? 'Comment disliked' : 'Dislike removed',
      data: formattedComment,
    });

    res.json({
      message: isNowDisliked ? 'Comment disliked successfully' : 'Dislike removed successfully',
      comment: formattedComment,
    });
  } catch (error) {
    if (error.message === 'Comment not found') error.statusCode = 404;
    throw error;
  }
};

const createReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.validatedData;
    
    const reply = await commentService.createReply(text, req.userId, commentId);
    const populatedReply = await reply.populate('author', 'name email');
    const formattedReply = formatResponse(populatedReply, req.userId);

    // fetch parent comment with updated replies
    const refreshedComment = await commentService.getCommentWithReplies(commentId);
    const formattedParent = refreshedComment 
      ? formatCommentWithReplies(refreshedComment, req.userId, refreshedComment.replies)
      : null;
    
    req.io.emit('NEW_REPLY_BROADCAST', {
      status: 'ok',
      data: formattedParent || formattedReply,
    });
    
    res.status(201).json({
      message: 'Reply created successfully',
      reply: formattedReply,
      comment: formattedParent,
    });
  } catch (error) {
    if (error.message === 'Parent comment not found') error.statusCode = 404;
    throw error;
  }
};

const updateReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const { text } = req.validatedData;
    
    const reply = await commentService.updateReply(replyId, text, req.userId);
    const populatedReply = await reply.populate('author', 'name email');
    const formattedReply = formatResponse(populatedReply, req.userId);
    
    req.io.emit('REPLY_UPDATE_BROADCAST', { status: 'ok', data: formattedReply });
    res.json({ message: 'Reply updated successfully', reply: formattedReply });
  } catch (error) {
    if (error.message.includes('Not authorized')) error.statusCode = 403;
    else if (error.message === 'Reply not found') error.statusCode = 404;
    throw error;
  }
};

const deleteReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const result = await commentService.deleteReply(replyId, req.userId);

    // fetch parent comment with updated replies list
    const refreshedComment = await commentService.getCommentWithReplies(result.parentCommentId);
    const formattedParent = refreshedComment 
      ? formatCommentWithReplies(refreshedComment, req.userId, refreshedComment.replies)
      : null;
    
    req.io.emit('REPLY_DELETE_BROADCAST', {
      status: 'ok',
      data: { replyId: result.replyId, comment: formattedParent },
    });
    
    res.json({ message: 'Reply deleted successfully', comment: formattedParent });
  } catch (error) {
    if (error.message.includes('Not authorized')) error.statusCode = 403;
    else if (error.message === 'Reply not found') error.statusCode = 404;
    throw error;
  }
};

const likeReply = async (req, res) => {
  try {
    const reply = await commentService.likeReply(req.params.replyId, req.userId);
    const populatedReply = await reply.populate('author', 'name email');
    const isNowLiked = reply.likes?.some((id) => id.toString() === req.userId.toString());
    const formattedReply = formatResponse(populatedReply, req.userId);

    req.io.emit('REPLY_LIKE_BROADCAST', {
      status: 'ok',
      message: isNowLiked ? 'Reply liked' : 'Like removed',
      data: formattedReply,
    });

    res.json({
      message: isNowLiked ? 'Reply liked successfully' : 'Like removed successfully',
      reply: formattedReply,
    });
  } catch (error) {
    if (error.message === 'Comment not found') error.statusCode = 404;
    throw error;
  }
};

const dislikeReply = async (req, res) => {
  try {
    const reply = await commentService.dislikeReply(req.params.replyId, req.userId);
    const populatedReply = await reply.populate('author', 'name email');
    const isNowDisliked = reply.dislikes?.some((id) => id.toString() === req.userId.toString());
    const formattedReply = formatResponse(populatedReply, req.userId);

    req.io.emit('REPLY_DISLIKE_BROADCAST', {
      status: 'ok',
      message: isNowDisliked ? 'Reply disliked' : 'Dislike removed',
      data: formattedReply,
    });

    res.json({
      message: isNowDisliked ? 'Reply disliked successfully' : 'Dislike removed successfully',
      reply: formattedReply,
    });
  } catch (error) {
    if (error.message === 'Comment not found') error.statusCode = 404;
    throw error;
  }
};

export {
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
};
