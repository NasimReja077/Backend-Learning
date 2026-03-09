import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/user.model.js";

const makeAdmin = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: node makeAdmin.js <email>");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
  }

  user.role = "admin";
  await user.save();
  console.log(`✅ ${user.username} (${user.email}) is now an admin!`);
  console.log("Please log out and log back in for the change to take effect.");

  await mongoose.disconnect();
  process.exit(0);
};

makeAdmin().catch((e) => { console.error(e); process.exit(1); });
