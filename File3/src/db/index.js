import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// this is raper // crreat a utilit file for raper
const connectDB = async () => { // async wait
     try {
          const connectionInStance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
          console.log(`\n MongoDB connected !! DB HOST: ${connectionInStance.connection.host}`)
     } catch (error) {
          console.log("MONGODB Connection FAILED ", error);
          process.exit(1)
     }
}

export default connectDB
// monguse give return object