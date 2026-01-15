import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      minlength: [1, "Post title cannot be empty"],
      maxlength: [50, "Post title cannot exceed 50 characters"],
    },
    body: {
      type: String,
      required: [true, "Post body is required"],
      trim: true,
      minlength: [1, "Post body cannot be empty"],
      maxlength: [1000, "Post body cannot exceed 1000 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: null,
    },
    dislikes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.plugin(mongoosePaginate);

postSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model("Post", postSchema);
