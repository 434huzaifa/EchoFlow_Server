import Post from '../models/Post.js';

class PostService {
  async createPost(title, body, authorId) {
    const post = new Post({
      title,
      body,
      author: authorId,
    });
    return await post.save();
  }

  async getPosts(page = 1, limit = 10) {
    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: { path: 'author', select: 'name email' },
      lean: false,
    };

    const result = await Post.paginate({}, options);

    return {
      posts: result.docs,
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

  async getPostById(id) {
    return await Post.findById(id).populate('author', 'name email');
  }

  async updatePost(id, updates, userId) {
    const post = await Post.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    if (post.author.toString() !== userId) {
      throw new Error('Not authorized to update this post');
    }
    if (updates.title !== undefined) post.title = updates.title;
    if (updates.body !== undefined) post.body = updates.body;
    return await post.save();
  }

  async deletePost(id, userId) {
    const post = await Post.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    if (post.author.toString() !== userId) {
      throw new Error('Not authorized to delete this post');
    }
    return await Post.findByIdAndDelete(id);
  }

  // helper for toggle post reaction
  async _togglePostReaction(postId, userId, reactionType) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const userIdStr = userId.toString();
    const oppositeType = reactionType === 'likes' ? 'dislikes' : 'likes';
    const hasReacted = post[reactionType]?.some((id) => id.toString() === userIdStr);

    if (hasReacted) {
      // remove existing reaction
      post[reactionType] = post[reactionType].filter(
        (id) => id.toString() !== userIdStr
      );
    } else {
      // add new reaction and remove opposit
      if (post[oppositeType]?.some((id) => id.toString() === userIdStr)) {
        post[oppositeType] = post[oppositeType].filter(
          (id) => id.toString() !== userIdStr
        );
      }
      if (!post[reactionType]) post[reactionType] = [];
      post[reactionType].push(userId);
    }

    await post.save();
    return await post.populate('author', 'name email');
  }

  async likePost(postId, userId) {
    return await this._togglePostReaction(postId, userId, 'likes');
  }

  async dislikePost(postId, userId) {
    return await this._togglePostReaction(postId, userId, 'dislikes');
  }
}

export default new PostService();
