// dest or storage - Where to store the files
// fileFilter - Function to control which files are accepted
// limits	- Limits of the uploaded data
// preservePath - Keep the full path of files instead of just the base name

/**
 * fileFilter
Set this to a function to control which files should be uploaded and which should be skipped. The function should look like this:

function fileFilter (req, file, cb) {

  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

  // To reject this file pass `false`, like so:
  cb(null, false)

  // To accept the file pass `true`, like so:
  cb(null, true)

  // You can always pass an error if something goes wrong:
  cb(new Error('I don\'t have a clue!'))

}

What is (req, file, cb)?: This is the signature of the filename function required by multer.diskStorage. It allows you to customize the filename based on the request or file details. The cb (callback) is called to pass the computed filename back to Multer.

What is file.originalname?: This is a property of the file object provided by Multer, representing the original name of the file as it was on the client’s device (e.g., myphoto.jpg).
Why use it?: The timestamp ensures uniqueness (e.g., 1697051234567@-myphoto.jpg), preventing overwrites if multiple users upload files with the same name.

Defines a fileFilter function to validate uploaded files based on their extension and MIME type.
What is fileFilter?: A function that determines whether a file should be accepted or rejected by Multer.
Why use it?: To enforce security and application requirements by only allowing specific file types (images in this case), preventing users from uploading invalid or malicious files.

What is .test?: A method of JavaScript’s RegExp object that checks if a string matches the regular expression. It returns true if there’s a match, false otherwise.
Alternatives to .test:Array.includes: You could maintain an array of allowed extensions (e.g., ['jpeg', 'jpg', 'png', 'gif', 'webp']) and use includes to check if the extension (without the dot) is in the array. Example:javascript

const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
const extname = allowedExtensions.includes(path.extname(file.originalname).toLowerCase().slice(1));

This is simpler but less flexible than regex for complex patterns.
Custom string matching: You could manually check the extension using string methods, but this is error-prone and less maintainable.

Why use .test?: It’s concise, efficient, and supports complex pattern matching via regex, making it ideal for validating file extensions.

mimetype -
What is it?: Checks if the file’s MIME type matches the allowed image types.
What is mimetype?: The MIME type is a standard identifier for the file’s format, provided by the client (e.g., image/jpeg, image/png). It’s stored in file.mimetype by Multer.



 */

import multer from 'multer';
import path from 'path';

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
};

const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|gif|webp/;

const storage = multer.diskStorage({
  destination: '../public/uploads/', 
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}@-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extname = ALLOWED_IMAGE_TYPES.test(path.extname(file.originalname).toLowerCase());
  const mimetype = ALLOWED_IMAGE_TYPES.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMITS.IMAGE },
  fileFilter,
});