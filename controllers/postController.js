import postService from "../services/postService.js";
import { formatResponse } from "../common/helpers.js";

const createPost = async (req, res) => {
  const { title, body } = req.validatedData;
  const post = await postService.createPost(title, body, req.userId);
  const populatedPost = await post.populate("author", "name email");
  const formattedPost = formatResponse(populatedPost, req.userId);

  req.io.emit("NEW_POST_BROADCAST", { status: "ok", data: formattedPost });
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
    const post = await postService.updatePost(req.params.id, { title, body }, req.userId);
    const populatedPost = await post.populate("author", "name email");
    const formattedPost = formatResponse(populatedPost, req.userId);

    req.io.emit("POST_UPDATE_BROADCAST", { status: "ok", data: formattedPost });
    res.json({ message: "Post updated successfully", post: formattedPost });
  } catch (error) {
    if (error.message.includes("Not authorized")) error.statusCode = 403;
    throw error;
  }
};

const deletePost = async (req, res) => {
  try {
    await postService.deletePost(req.params.id, req.userId);
    req.io.emit("POST_DELETE_BROADCAST", { status: "ok", data: { postId: req.params.id } });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    if (error.message.includes("Not authorized")) error.statusCode = 403;
    throw error;
  }
};

const likePost = async (req, res) => {
  try {
    const post = await postService.likePost(req.params.id, req.userId);
    const isNowLiked = post.likes?.some((id) => id.toString() === req.userId.toString());
    const formattedPost = formatResponse(post, req.userId);

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
    if (error.message === "Post not found") error.statusCode = 404;
    throw error;
  }
};

const dislikePost = async (req, res) => {
  try {
    const post = await postService.dislikePost(req.params.id, req.userId);
    const isNowDisliked = post.dislikes?.some((id) => id.toString() === req.userId.toString());
    const formattedPost = formatResponse(post, req.userId);

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
    if (error.message === "Post not found") error.statusCode = 404;
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
