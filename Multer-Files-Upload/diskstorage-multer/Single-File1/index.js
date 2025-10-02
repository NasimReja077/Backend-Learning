import { resolve } from 'path';
import express, { json } from 'express';
import multer from 'multer';
import crypto from "crypto";

// We use multer to take a file stream from multipart/form-data and store it on disk or memory. 

const app = express(); // Initializes app.
const port = 3000;


// created two absolute path for storing upload files
const avatarUploadPath = resolve('./upload/avatars/images');// Converts a relative path to an absolute path using path.resolve().
const blogUploadPath = resolve('./upload/blogs/images');

// ---------------- Avatar Storage ----------------
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb){
    return cb(null, avatarUploadPath);
  },
   filename: function (req, file, cb) {
    return cb(null, `${Date.now()}@-${file.originalname}`)
   }
});
// destination callback: In which folder the file will be written.
// filename callback: what name the file will be saved.

// only allow image files
function avatarFileFilter(req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if(!allowedTypes.includes(file.mimetype)){
    return cb(new Error("Only image files (jpg, png, gif, webp) are allowed!"), false);
  }
  cb(null, true);
}
const uploadAvatar = multer({ 
  storage: avatarStorage ,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2mb
  },
  fileFilter: avatarFileFilter
});

// ---------------- Blog Storage ----------------

const blogStorage = multer.diskStorage({
  destination: function (req, file, cb){
    return cb(null, blogUploadPath);
  },
   filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(15).toString("hex");
    const ext = file.originalname.split('.').pop();
    return cb(null, `${uniqueSuffix}.${ext}`);
   }
});
const uploadBlog = multer({ 
  storage: blogStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB size limit
  }
});

// ---------------- Express Config

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', resolve('./views'));

app.use(express.urlencoded({ extended: false })); // help to pass form data

// serve static files (so uploaded images can be viewed)
app.use('/uploads/avatars', express.static(avatarUploadPath));
app.use('/uploads/blogs', express.static(blogUploadPath));

// ------- Routs--------

// avatar upload 
app.get("/", (req, res) => {
     return res.render("uploadavatar", { file: null });
})

// app.post('/upload/avatars/images', uploadAvatar.single('avatarImage'), (req, res) => {
//   console.log(req.body);
//   console.log(req.file);
//   return res.redirect("/");
// });

app.post('/upload/avatars/images', (req, res) => {
  uploadAvatar.single('avatarImage')(req, res, function(err){
    if(err instanceof multer.MulterError){
      // in-built error
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).send("File too large! Max size 2MB.");
      }
      return res.status(400).send("Multer error: " + err.message);
    } else if (err) {
      // custom errors
      return res.status(400).send(err.message);
    }
    // success
    // console.log(req.file);
    // return res.send("✅ Avatar uploaded successfully!");

    // Success: render page with file data
    return res.render("uploadavatar", { file: req.file });
    });
  })

app.get("/blog", (req, res)=>{
     return res.render("uploadblog", { files: [] })
})

// app.post('/upload/blogs/images', uploadBlog.array('blogImages', 5), (req, res) => {
//   console.log(req.body);
//   console.log(req.file);
//   return res.redirect("/blog");
// });

app.post('/upload/blogs/images', (req, res) => {
  uploadBlog.array('blogImages', 5)(req, res, function(err){
    if (err) return res.status(400).send(err.message);

    // Success
    return res.render("uploadblog", { files: req.files });
  })
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});