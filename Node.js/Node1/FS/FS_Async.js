import fs from "fs";
import path from "path";

const fileName = "fsAsycn.txt";
const filePath = path.join(__dirname, fileName);

/**
 * fs.writeFileSync(): Writes data to a file,replacing the file if it already exist.
// ! syntax: fs.writeFileSync(path, data, options, callback);

//? path: File path to write to. 
//? data: The content to write to the file.
//? options: Optional. Specifies encoding ('utf8'), mode, or flags.
//? callback: A function with an err parameter.
 */

// fs.writeFile(filePath, "This is the initial Data", "utf-8", 
//      (err) =>{
//           if(err) console.error(err);
//           else console.log("File has been Saved");
//      }
// );

/**
 * ---------------------------------------------------------------------------------- *
//* fs.readFile(): Reads the contents of a file asynchronously and returns the data as a buffer
// or string.
// ! syntax: fs.readFile(path, options, callback);
// 
// ? path: File path to read from.
// ? options: Optional. An object or string specifying the encoding ('utf8') or flag ('r' for 
// reading).
// ? callback: A function with parameters (err, data).
// * ---------------------------------------------------------------------------------- */

// fs.readFile(filePath, "utf-8", (err, data) =>{
//           if(err) console.error(err);
//           else console.log(data);
//      }
// );

//* fs.appendFile(): Appends data to a file, creating the file if it does not exist, it is created.

// ! syntax: fs.appendFile(path, data, options, callback);

//-------------

// fs.appendFile(filePath, "\nThis is the Updated Data", "utf-8",(err) =>{
//     if(err) console.error(err);
//     else console.log("File has been Saved");
// });

//* fs.unlink(): Deletes a file asynchronously.
// ! syntax: fs.unlink(path, callback);

fs.unlink(filePath, (err) =>{
     if(err) console.error(err);
     else console.log("File has been Deleted");
});