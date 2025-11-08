import productModel from "../models/product.model.js";

export const getAllProducts = async(req, res)=>{
     try {
          const myProductsData = await productModel.find({});
          res.status(200).json({ success: true, myProductsData });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message })
     }
};

export const getAllProductsTesting = async (req, res) =>{
     res.status(200).json({ msg: "I am Tester, Bro"})
}