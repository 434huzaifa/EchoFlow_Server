import commentService from "../services/commentService.js";

const handleFetchComments = async (socket, payload, callback) => {
  try {
    const { postId, sortBy = "newest" } = payload;

    const comments = await commentService.getCommentsByPostId(postId, sortBy);

    callback({
      status: "ok",
      data: comments,
    });
  } catch (error) {
    console.error("Error in FETCH_COMMENTS_REQUEST:", error);
    callback({
      status: "error",
      message: error.message,
    });
  }
};

const handleFetchCommentReplies = async (socket, payload, callback) => {
  try {
    const { commentId } = payload;

    // Fetch the parent comment along with its replies
    const commentWithReplies = await commentService.getCommentWithReplies(commentId);

    callback({
      status: "ok",
      data: commentWithReplies || {},
    });
  } catch (error) {
    console.error("Error in FETCH_COMMENT_REPLIES_REQUEST:", error);
    callback({
      status: "error",
      message: error.message,
    });
  }
};

export { handleFetchComments, handleFetchCommentReplies };
