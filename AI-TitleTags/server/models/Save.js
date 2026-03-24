// models/Save.js
import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;  // ← Destructure from the default export

const saveSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  title: String,
  tags: [String],
  content: String,
//   type: {
//   type: String,
//   enum: ['article', 'youtube', 'pdf', 'tweet', 'image', 'other', 'error'],  // ← add 'error' if you prefer
//   default: 'other'
// },
type: {
  type: String,
  enum: ['article', 'youtube', 'pdf', 'tweet', 'image', 'other'],
  default: 'other'
},
  metadata: { type: Object, default: {} },
  savedAt: { type: Date, default: Date.now, index: true }
});

// Singleton pattern (prevents overwrite on nodemon restarts)
const Save = models.Save || model('Save', saveSchema);

export default Save;