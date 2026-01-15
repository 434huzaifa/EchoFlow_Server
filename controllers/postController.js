import postService from "../services/postService.js";

const formatPostResponse = (post, userId, overrides = {}) => {
  const userIdStr = userId?.toString();
  const postObj = post.toObject ? post.toObject() : post;
  
  return {
    _id: postObj._id,
    title: postObj.title,
    body: postObj.body,
    author: postObj.author,
    likes: postObj.likes || [],
    dislikes: postObj.dislikes || [],
    createdAt: postObj.createdAt,
    updatedAt: postObj.updatedAt,
    __v: postObj.__v,
    commentsCount: postObj.commentsCount || 0,
    likesCount: postObj.likes?.length || 0,
    dislikesCount: postObj.dislikes?.length || 0,
    isAuthor: postObj.author._id.toString() === userIdStr,
    userInteraction: postObj.likes?.some((id) => id.toString() === userIdStr)
      ? "liked"
      : postObj.dislikes?.some((id) => id.toString() === userIdStr)
      ? "disliked"
      : "none",
    ...overrides,
  };
};

const createPost = async (req, res) => {
  const { title, body } = req.validatedData;
  const post = await postService.createPost(title, body, req.userId);

  const populatedPost = await post.populate("author", "name email");
  const formattedPost = formatPostResponse(populatedPost, req.userId);

  req.io.emit("NEW_POST_BROADCAST", {
    status: "ok",
    data: formattedPost,
  });

  res.status(201).json({ message: "Post created successfully", post: formattedPost });
};

const getPosts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await postService.getPosts(parseInt(page), parseInt(limit));
  res.json(result);
};

const getPostById = async (req, res) => {
  const post = await postService.getPostById(req.params.id);
  if (!post) {
    const error = new Error("Post not found");
    error.statusCode = 404;
    throw error;
  }
  res.json(post);
};

const updatePost = async (req, res) => {
  const { title, body } = req.validatedData;
  try {
    const post = await postService.updatePost(
      req.params.id,
      { title, body },
      req.userId
    );
    const populatedPost = await post.populate("author", "name email");
    const formattedPost = formatPostResponse(populatedPost, req.userId);

    req.io.emit("POST_UPDATE_BROADCAST", {
      status: "ok",
      data: formattedPost,
    });
    res.json({ message: "Post updated successfully", post: formattedPost });
  } catch (error) {
    if (error.message.includes("Not authorized")) {
      error.statusCode = 403;
    }
    throw error;
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    await postService.deletePost(postId, req.userId);
    
    req.io.emit("POST_DELETE_BROADCAST", {
      status: "ok",
      data: {
        postId,
      },
    });
    
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    if (error.message.includes("Not authorized")) {
      error.statusCode = 403;
    }
    throw error;
  }
};

const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await postService.likePost(postId, req.userId);
    const populatedPost = await post.populate("author", "name email");

    const userIdStr = req.userId.toString();
    const isNowLiked = post.likes?.some((id) => id.toString() === userIdStr);

    const formattedPost = formatPostResponse(populatedPost, req.userId);

    req.io.emit("REFETCH_POSTS", {
      status: "ok",
      message: isNowLiked ? "Post liked" : "Like removed",
      data: formattedPost,
    });

    res.json({
      message: isNowLiked ? "Post liked successfully" : "Like removed successfully",
      post: formattedPost,
    });
  } catch (error) {
    if (error.message === "Post not found") {
      error.statusCode = 404;
    }
    throw error;
  }
};

const dislikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await postService.dislikePost(postId, req.userId);
    const populatedPost = await post.populate("author", "name email");

    const userIdStr = req.userId.toString();
    const isNowDisliked = post.dislikes?.some((id) => id.toString() === userIdStr);

    const formattedPost = formatPostResponse(populatedPost, req.userId);

    req.io.emit("REFETCH_POSTS", {
      status: "ok",
      message: isNowDisliked ? "Post disliked" : "Dislike removed",
      data: formattedPost,
    });

    res.json({
      message: isNowDisliked ? "Post disliked successfully" : "Dislike removed successfully",
      post: formattedPost,
    });
  } catch (error) {
    if (error.message === "Post not found") {
      error.statusCode = 404;
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
  likePost,
  dislikePost,
};
