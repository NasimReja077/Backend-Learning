import multer from "multer";

const storage = multer.diskStorage({ // storage name mathode it is use middle ware
     destination: function (req, file, cb) {
       cb(null, "./public/temp")
     },
     filename: function (req, file, cb) {

       cb(null, file.originalname)
     }
   })
export const upload = multer({ 
     storage,
})

// https://www.npmjs.com/package/multer