import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    path:{ // replay path
      type:String,
      default:null,
    },
    post:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Post",
      required: [true, 'Post is required for comment'],
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    dislikes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.plugin(mongoosePaginate);

// Indexes as per specification
// One comment per user per post (root comments only)
commentSchema.index(
  { author: 1, post: 1, path: 1 },
  { unique: true, sparse: true, partialFilterExpression: { path: null } }
);

// For efficient replies queries
commentSchema.index({ post: 1, path: 1 });

// For sorting by likes/dislikes
commentSchema.index({ likes: 1 });
commentSchema.index({ dislikes: 1 });

// For sorting by date
commentSchema.index({ createdAt: -1 });
commentSchema.index({ updatedAt: -1 });

export default mongoose.model('Comment', commentSchema);
