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
      populate: { path: 'author', select: 'Name email' },
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
    return await Post.findById(id).populate('author', 'Name email');
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

  async likePost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const userIdStr = userId.toString();
    const hasLiked = post.likes?.some((id) => id.toString() === userIdStr);
    const hasDisliked = post.dislikes?.some((id) => id.toString() === userIdStr);

    if (hasLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      if (hasDisliked) {
        post.dislikes = post.dislikes.filter((id) => id.toString() !== userIdStr);
      }
      if (!post.likes) post.likes = [];
      post.likes.push(userId);
    }

    await post.save();
    return await post.populate('author', 'name email');
  }

  async dislikePost(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const userIdStr = userId.toString();
    const hasLiked = post.likes?.some((id) => id.toString() === userIdStr);
    const hasDisliked = post.dislikes?.some((id) => id.toString() === userIdStr);

    if (hasDisliked) {
      post.dislikes = post.dislikes.filter((id) => id.toString() !== userIdStr);
    } else {
      if (hasLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
      }
      if (!post.dislikes) post.dislikes = [];
      post.dislikes.push(userId);
    }

    await post.save();
    return await post.populate('author', 'name email');
  }
}

export default new PostService();
