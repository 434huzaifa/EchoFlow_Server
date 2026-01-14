import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const postSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, 'Post comment is required'],
      trim: true,
      minlength: [1, 'Post comment cannot be empty'],
      maxlength: [1000, 'Post comment cannot exceed 1000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Add pagination plugin
postSchema.plugin(mongoosePaginate);

// Index for author recent posts
postSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);
