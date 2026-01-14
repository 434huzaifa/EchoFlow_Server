import Comment from '../models/Comment.js';

class CommentService {
  async createComment(text, authorId, postId, path = null) {
    const comment = new Comment({
      text,
      author: authorId,
      post: postId,
      path,
    });
    return await comment.save();
  }

  async getComments(page = 1, limit = 10, sortBy = 'newest') {
    let sortOption = { createdAt: -1 };

    if (sortBy === 'mostLiked') {
      sortOption = { 'likes': -1, createdAt: -1 };
    } else if (sortBy === 'mostDisliked') {
      sortOption = { 'dislikes': -1, createdAt: -1 };
    }

    const options = {
      page,
      limit,
      sort: sortOption,
      populate: [
        { path: 'author', select: 'Name email' },
        { path: 'post', select: 'title' }
      ],
      lean: false,
    };

    const result = await Comment.paginate({}, options);

    return {
      comments: result.docs,
      pagination: {
        total: result.totalDocs,
        page: result.page,
        pages: result.totalPages,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    };
  }

  async getCommentById(id) {
    return await Comment.findById(id)
      .populate('author', 'Name email')
      .populate('post', 'title');
  }

  async updateComment(id, text, userId) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }
    if (comment.author.toString() !== userId) {
      throw new Error('Not authorized to update this comment');
    }
    comment.text = text;
    return await comment.save();
  }

  async deleteComment(id, userId) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }
    if (comment.author.toString() !== userId) {
      throw new Error('Not authorized to delete this comment');
    }
    return await Comment.findByIdAndDelete(id);
  }

  async likeComment(id, userId) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const userIdStr = userId.toString();
    if (comment.likes.includes(userIdStr)) {
      comment.likes = comment.likes.filter(id => id.toString() !== userIdStr);
    } else {
      comment.likes.push(userId);
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userIdStr);
    }

    return await comment.save();
  }

  async dislikeComment(id, userId) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const userIdStr = userId.toString();
    if (comment.dislikes.includes(userIdStr)) {
      comment.dislikes = comment.dislikes.filter(id => id.toString() !== userIdStr);
    } else {
      comment.dislikes.push(userId);
      comment.likes = comment.likes.filter(id => id.toString() !== userIdStr);
    }

    return await comment.save();
  }
}

export default new CommentService();
