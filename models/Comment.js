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

commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ likes: 1 });
commentSchema.index({ dislikes: 1 });

export default mongoose.model('Comment', commentSchema);
