import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  thumbnail: {
    url: String,
    publicId: String,
  },
  contentImages: [{
    url: String,
    publicId: String,
  }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Blog', blogSchema);