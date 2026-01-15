import Post from "../models/Post.js";
import commentService from "../services/commentService.js";


const handleFetchPosts = async (socket, payload, callback) => {
  try {
    const { cursor, limit = 10 } = payload;
    const currentUserId = socket.userId;

    const query = cursor ? { createdAt: { $lt: new Date(cursor) } } : {};

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .populate("author", "name email");

    const postIds = posts.map((post) => post._id);
    const numberOfCommentEachPost =
      await commentService.getNumberOfCommentsForPosts(postIds);

    posts.forEach((post) => {
      const commentCount =
        numberOfCommentEachPost?.[post?._id?.toString()] ?? 0;
      post.commentsCount = commentCount ? commentCount : 0;
    });
    const hasMore = posts.length > limit;
    const paginatedPosts = posts.slice(0, limit);

    const enrichedPosts = paginatedPosts.map((post) => {
      return {
        ...post,
        likesCount: post.likes?.length || 0,
        dislikesCount: post.dislikes?.length || 0,
        commentsCount: post.commentsCount || 0,
        isAuthor: post.author._id.toString() === currentUserId,
        userInteraction: post.likes?.includes(currentUserId)
          ? "liked"
          : post.dislikes?.includes(currentUserId)
          ? "disliked"
          : "none",
      };
    });

    const nextCursor =
      hasMore && paginatedPosts.length > 0
        ? paginatedPosts[paginatedPosts.length - 1].createdAt
        : null;

    callback({
      status: "ok",
      data: enrichedPosts,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error in FETCH_POSTS_REQUEST:", error);
    callback({
      status: "error",
      message: error.message,
    });
  }
};

export { handleFetchPosts };
