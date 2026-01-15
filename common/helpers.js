export const formatResponse = (item, userId, overrides = {}) => {
  const userIdStr = userId?.toString();
  const itemObj = item.toObject ? item.toObject() : item;
  
  return {
    _id: itemObj._id,
    text: itemObj.text,
    title: itemObj.title,
    body: itemObj.body,
    author: itemObj.author,
    post: itemObj.post,
    path: itemObj.path,
    likes: itemObj.likes || [],
    dislikes: itemObj.dislikes || [],
    createdAt: itemObj.createdAt,
    updatedAt: itemObj.updatedAt,
    __v: itemObj.__v,
    commentsCount: itemObj.commentsCount || 0,
    likesCount: itemObj.likes?.length || 0,
    dislikesCount: itemObj.dislikes?.length || 0,
    isAuthor: itemObj.author._id.toString() === userIdStr,
    userInteraction: itemObj.likes?.some((id) => id.toString() === userIdStr)
      ? "liked"
      : itemObj.dislikes?.some((id) => id.toString() === userIdStr)
      ? "disliked"
      : "none",
    ...overrides,
  };
};

// helper to handle errors with status code
export const handleError = (error, defaultStatusCode = 500) => {
  if (!error.statusCode) {
    error.statusCode = defaultStatusCode;
  }
  throw error;
};
