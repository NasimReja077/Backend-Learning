import express from "express";
import { getAllProducts, getAllProductsTesting } from "../controllers/product.controller.js";
const router = express.Router();
router.get("/allproducts", getAllProducts);
router.get("/test", getAllProductsTesting);

export default router;