import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: {
    url: String,
    publicId: String,
  },
  cover: {
    url: String,
    publicId: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);