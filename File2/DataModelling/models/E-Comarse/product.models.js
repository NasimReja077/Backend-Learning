import mongoose, { Types } from "mongoose"
import { Category } from "./category.models"

const productSchema = new mongoose.Schema({
  description:{
    required: true,
    Type: String
  },
  name: {
    required: true,
      type: String,
  },
  productImage: {
    type: String,
  },
  price: {
    Type: Number,
    default: 0,
  },
  stock: {
    default: 0,
    type: Number,
  },
  Category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

},
{ timestamps: true}
);

export const Product = mongoose.model('Product', productSchema);