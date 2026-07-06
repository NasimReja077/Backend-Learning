import mongoose from "mongoose";

const connectDB = async () => {
  try{
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMs: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`✅ MongoDB Connected Successfully ${conn.connection.host}`);
  }catch (err){
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;