import Post from '../models/Post.js';

class PostService {
  async createPost(comment, authorId) {
    const post = new Post({
      comment,
      author: authorId,
    });
    return await post.save();
  }

  async getPosts(page = 1, limit = 10) {
    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: { path: 'author', select: 'username email' },
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
    return await Post.findById(id).populate('author', 'username email');
  }

  async updatePost(id, comment, userId) {
    const post = await Post.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    if (post.author.toString() !== userId) {
      throw new Error('Not authorized to update this post');
    }
    post.comment = comment;
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
}

export default new PostService();
