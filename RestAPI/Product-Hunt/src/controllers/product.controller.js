import productModel from "../models/product.model.js";

export const getAllProducts = async(req, res)=>{
     try {
          const { company, name, featured, sort, select } = req.query;
          const queryObject = {};

          if (company){
               queryObject.company = company;
               // console.log(queryObject);
          }

           if (name) {
      queryObject.name = { $regex: name, $options: "i" }; // ✅ fixed
    }

           // First create query
          let apiData = productModel.find(queryObject);

          if (featured) {
               queryObject.featured = featured;
          }

           // Sorting (sort=name,price)

          if (sort) {
               let sortFix = sort.replace(",", " ");
               // queryObject.sort = sortFix;
               apiData = apiData.sort(sortFix);
          }

           // Selecting Fields (select=name,company)
          if(select){
               // let selectFix = select.replace("," , " ");
               // apiData = apiData.select(selectFix)
               let selectFix = select.split(",").join(" ");
               apiData = apiData.select(selectFix)
          }

           // Pagination
           
          let page = Number(req.query.page) || 1;
          let limit= Number(req.query.limit) || 3;
          let skip = (page - 1) * limit;
          // page = 2
          // limit = 3;
          // skip = 1 * 3 = 3
          apiData = apiData.skip(skip).limit(limit);
          console.log(queryObject);

          const myProductsData = await apiData;
          res.status(200).json({ 
               success: true, 
               total: myProductsData.length, page, limit, 
               data: myProductsData, 
          });
     } catch (error) {
          res.status(500).json({ success: false, error: error.message })
     }
};

export const getAllProductsTesting = async (req, res) =>{
     res.status(200).json({ msg: "I am Tester, Bro"})
}