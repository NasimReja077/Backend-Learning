import mongoose from "mongoose";

const connectDB = async () => {
     try {
          const connectDatabase = await mongoose.connect(`${process.env.MONGODB_URI}`)
          console.log(`\n MongoDB connected !! DB HOST: ${connectDatabase.connection.host}`)
     } catch (error) {
          console.log("MONGODB Connection FAILED ", error);
     }
}

export default connectDB;