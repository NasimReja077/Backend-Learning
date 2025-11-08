import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
     name: {
          type: String,
          required: true,
     },
     price: {
          type: Number,
          required: [true, "Price must be provided"],
     },
     featured: {
          type: Boolean,
          default: false,
     },
     rating:{
          type: Number,
          default: 4.5,
     }, 
     company: {
          type: String,
          enum:{
               values: ["apple", "samsung", "dell", "mi", "nokia", "asus", "lg"],
               message: `{VALUE} is not Supported`,
          },
     }
},
{timestamps: true}
);

export default mongoose.model("Product", productSchema);