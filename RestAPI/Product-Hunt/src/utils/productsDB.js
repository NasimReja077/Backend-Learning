import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../db/index.js";
import Product from "../models/product.model.js";

dotenv.config();

// Needed to get correct path in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load JSON file safely
const dataPath = path.join(__dirname, "products.json");
const ProductJson = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

const productSeeder = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);

    await Product.deleteMany(); // Remove old data
    await Product.insertMany(ProductJson); // Insert new

    console.log("✅ Products Inserted Successfully!");
    process.exit(0);
  } catch (error) {
    console.log("❌ Error:", error.message);
    process.exit(1);
  }
};

productSeeder();
