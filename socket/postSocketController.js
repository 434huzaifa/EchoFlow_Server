import Post from "../models/Post.js";
import commentService from "../services/commentService.js";

const handleFetchPosts = async (socket, payload, callback) => {
  try {
    const { cursor, limit = 10, sort } = payload;
    console.info("🚀 ~ handleFetchPosts ~ sort:", sort);
    const currentUserId = socket.userId;

    const query = cursor ? { createdAt: { $lt: new Date(cursor) } } : {};

    // Determine sort stage based on sort parameter
    let sortStage = { createdAt: -1 }; // default: newest first

    if (sort === "2") {
      sortStage = { likesSize: -1, createdAt: -1 }; // most likes
    } else if (sort === "3") {
      sortStage = { dislikesSize: -1, createdAt: -1 }; // most dislikes
    }

    const posts = await Post.aggregate([
      { $match: query },
      {
        $addFields: {
          likesSize: {
            $cond: [{ $isArray: "$likes" }, { $size: "$likes" }, 0],
          },
          dislikesSize: {
            $cond: [{ $isArray: "$dislikes" }, { $size: "$dislikes" }, 0],
          },
        },
      },
      { $sort: sortStage },
      { $limit: limit + 1 },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorArray",
        },
      },
      {
        $addFields: {
          author: { $arrayElemAt: ["$authorArray", 0] },
        },
      },
      {
        $project: {
          authorArray: 0,
          "author.password": 0,
        },
      },
    ]);

    const postIds = posts.map((post) => post._id);
    const numberOfCommentEachPost =
      await commentService.getNumberOfCommentsForPosts(postIds);
    const postsWithMyComment = await commentService.findPostWithMyComment(
      currentUserId,
      postIds
    );
    posts.forEach((post) => {
      const commentCount =
        numberOfCommentEachPost?.[post?._id?.toString()] ?? 0;
      post.commentsCount = commentCount ? commentCount : 0;
      post.hasMyComment = postsWithMyComment.includes(post._id.toString());
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
