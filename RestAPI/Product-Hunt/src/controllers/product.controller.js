import productModel from "../models/product.model.js";

export const getAllProducts = async(req, res)=>{
     try {
          const { company, name, featured } = req.query;
          const queryObject = {};

          if (company){
               queryObject.company = company;
               // console.log(queryObject);
          }

          if (name) {
               queryObject.name = { $regex: name, $option: "i"};
          }

          if (featured) {
               queryObject.featured = featured;
          }

          console.log(queryObject);

          const myProductsData = await productModel.find(req.query);
          res.status(200).json({ success: true, myProductsData });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message })
     }
};

export const getAllProductsTesting = async (req, res) =>{
     res.status(200).json({ msg: "I am Tester, Bro"})
}