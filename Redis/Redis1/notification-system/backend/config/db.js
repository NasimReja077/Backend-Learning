import mongoose from "mongoose";
import { getSecret } from "./secrets.js";

const connectDB = async () => {
  try {
    await mongoose.connect(getSecret("MONGO_URI"));
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;