import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

class CommentService {
  async _checkDuplicateComment(authorId, postId) {
    const existingComment = await Comment.findOne({
      author: authorId,
      post: postId,
      path: null,
    });
    
    if (existingComment) {
      const error = new Error("You can only have one comment per post");
      error.statusCode = 409;
      throw error;
    }
  }

  async _updatePostCommentCount(postId, increment) {
    await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: increment } },
      { new: true }
    );
  }

  async createComment(text, authorId, postId, path = null) {
    if (!path) {
      await this._checkDuplicateComment(authorId, postId);
    }
    
    const comment = new Comment({ text, author: authorId, post: postId, path });
    const savedComment = await comment.save();
    
    await this._updatePostCommentCount(postId, 1);
    return savedComment;
  }

  async getComments(page = 1, limit = 10, sortBy = "newest") {
    let sortOption = { createdAt: -1 };

    if (sortBy === "mostLiked") {
      sortOption = { likes: -1, createdAt: -1 };
    } else if (sortBy === "mostDisliked") {
      sortOption = { dislikes: -1, createdAt: -1 };
    }

    const options = {
      page,
      limit,
      sort: sortOption,
      populate: [
        { path: "author", select: "name email" },
        { path: "post", select: "title" },
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

  async getCommentsByPostId(postId, sortBy = "newest") {
    let sortOption = { createdAt: -1 };

    if (sortBy === "mostLiked") {
      sortOption = { likesCount: -1, createdAt: -1 };
    } else if (sortBy === "mostDisliked") {
      sortOption = { dislikesCount: -1, createdAt: -1 };
    }

    const rootComments = await Comment.find({ post: postId, path: null })
      .sort(sortOption)
      .populate("author", "name email")
      .lean();

    const commentsWithReplies = await Promise.all(
      rootComments.map(async (comment) => {
        const replies = await Comment.find({ path: comment._id.toString() })
          .sort({ createdAt: -1 })
          .populate("author", "name email")
          .lean();
        
        return {
          ...comment,
          replies: replies || [],
        };
      })
    );

    return commentsWithReplies;
  }

  async getCommentById(id) {
    return await Comment.findById(id)
      .populate("author", "name email")
      .populate("post", "title");
  }

  async updateComment(id, text, userId) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    if (comment.author.toString() !== userId) {
      throw new Error("Not authorized to update this comment");
    }
    comment.text = text;
    return await comment.save();
  }

  async deleteComment(id, userId) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    if (comment.author.toString() !== userId) {
      throw new Error("Not authorized to delete this comment");
    }

    const replyCount = await Comment.countDocuments({ path: id });
    if (replyCount > 0) {
      await Comment.deleteMany({ path: id });
    }

    await Comment.findByIdAndDelete(id);
    await this._updatePostCommentCount(comment.post, -(1 + replyCount));

    return { commentId: id, replyCount };
  }

  // toggle like or dislike on comment/reply
  async _toggleReaction(id, userId, reactionType) {
    const comment = await Comment.findById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    const userIdStr = userId.toString();
    const oppositeType = reactionType === 'likes' ? 'dislikes' : 'likes';
    const hasReacted = comment[reactionType].some((id) => id.toString() === userIdStr);

    if (hasReacted) {
      // remove reaction
      comment[reactionType] = comment[reactionType].filter(
        (id) => id.toString() !== userIdStr
      );
    } else {
      // add reaction and remove opposite one if exist
      comment[reactionType].push(userId);
      comment[oppositeType] = comment[oppositeType].filter(
        (id) => id.toString() !== userIdStr
      );
    }

    return await comment.save();
  }

  async likeComment(id, userId) {
    return await this._toggleReaction(id, userId, 'likes');
  }

  async dislikeComment(id, userId) {
    return await this._toggleReaction(id, userId, 'dislikes');
  }

  async createReply(text, authorId, parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      throw new Error("Parent comment not found");
    }

    const reply = new Comment({
      text,
      author: authorId,
      post: parentComment.post,
      path: parentCommentId,
    });

    const savedReply = await reply.save();
    await this._updatePostCommentCount(parentComment.post, 1);

    return savedReply;
  }

  async updateReply(id, text, userId) {
    const reply = await Comment.findById(id);
    if (!reply) {
      throw new Error("Reply not found");
    }
    if (!reply.path) {
      throw new Error("This is not a reply");
    }
    if (reply.author.toString() !== userId) {
      throw new Error("Not authorized to update this reply");
    }

    reply.text = text;
    return await reply.save();
  }

  async deleteReply(id, userId) {
    const reply = await Comment.findById(id);
    if (!reply) {
      throw new Error("Reply not found");
    }
    if (!reply.path) {
      throw new Error("This is not a reply");
    }
    if (reply.author.toString() !== userId) {
      throw new Error("Not authorized to delete this reply");
    }

    await Comment.findByIdAndDelete(id);
    await this._updatePostCommentCount(reply.post, -1);

    return { replyId: id, parentCommentId: reply.path };
  }

  async getCommentWithReplies(commentId) {
    const parentComment = await Comment.findById(commentId)
      .populate("author", "name email")
      .lean();

    if (!parentComment) return null;

    const replies = await Comment.find({ path: commentId })
      .sort({ createdAt: -1 })
      .populate("author", "name email")
      .lean();

    return { ...parentComment, replies: replies || [] };
  }

  // replies use same like/dislike logic
  async likeReply(id, userId) {
    return this.likeComment(id, userId);
  }

  async dislikeReply(id, userId) {
    return this.dislikeComment(id, userId);
  }

  async getNumberOfCommentsForPosts(postIds) {
    const counts = await Comment.aggregate([
      {
        $match: {
          post: { $in: postIds },
          path: null,
        },
      },
      {
        $group: {
          _id: "$post",
          commentCount: { $sum: 1 },
        },
      },
    ]);

    return counts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.commentCount;
      return acc;
    }, {});
  }
  async findPostWithMyComment(userId, postIds){
    const comments = await Comment.find({
      author: userId,
      post: { $in: postIds },
      path: null, // Only root comments
    }).select("post");

    const postsWithMyComment = comments.map(comment => comment.post.toString());
    return postsWithMyComment;
  }
}

export default new CommentService();
