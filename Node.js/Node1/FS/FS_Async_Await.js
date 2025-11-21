import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileName = "asyncFile.txt";
const filePath = path.join(__dirname, fileName);

// fs.promises
//      .readdir(__dirname)
//      .then((data) => console.log(data))
//      .catch((err) => console.log(err));
//=================

// const readFolder = async () => {
//      try {
//           const res = await fs.promises.readdir(__dirname);
//           console.log(res)
//      } catch (error) {
//           console.error(error);
//      }
// };

// readFolder();


// * ---------------------------------------------------------------------------------- *
// * fsPromises.writeFile() : Writes data to a file asynchronously. If the file exists, it overwrites
// the content.
// ! syntax: fsPromises.writeFile(path, data, options);
// 
// ? path: The file path to write to.
// ? data: The content to write to the file.
// ? options: Optional. Specifies encoding (e.g., 'utf8'), mode, or flags.
// * ---------------------------------------------------------------------------------- *

// const writeFileAsync = async () => {
//      try {
//           await fs.writeFile(filePath, "This is the initial data", "utf-8");
//          console.log("File created successfully!"); 
//      } catch (error) {
//           console.error(err);
//      }
// }

// writeFileAsync();

// * ---------------------------------------------------------------------------------- *
// * Reading a File: fsPromises.readFile() : Reads the contents of a file asynchronously.
// ! syntax: fsPromises.readFile(path, options);
// 
// ? path: The file path to read.
// ? options: Optional. Can specify encoding (e.g., 'utf8') or return a Buffer if no encoding is 
// provided.
// * ---------------------------------------------------------------------------------- *

// const readFileAsync = async () => {
//      try {
//           const data = await fs.readFile(filePath, "utf-8");
//           console.log(data);
//      } catch (error) {
//           console.error(error);
//      }
// }
// readFileAsync();

// * ---------------------------------------------------------------------------------- *
// * Appending Data: fsPromises.appendFile() : Adds content to the end of a file. If the file does not exist, it creates a new
// one.
// ! syntax: fsPromises.appendFile(path, data, options);
// 
// ? path: The file path to read.
// ? options: Optional. Can specify encoding (e.g., 'utf8') or return a Buffer if no encoding is provided.
// * ---------------------------------------------------------------------------------- *

// const appendFileAsync = async () => {
//     try {
//         await fs.appendFile(filePath, "\nThis is the updated Data", "utf-8");
//         console.log("File created successfully!");
//     } catch (error) {
//         console.error(error);
//     }
// };

// appendFileAsync();


// * ---------------------------------------------------------------------------------- *
// * Deleting a File: fsPromises.unlink() : Deletes a file by its path.
// ! syntax: fsPromises.unlink(path)
// 
// ? path: The file path to delete.
// * ---------------------------------------------------------------------------------- *

const deleteFileAsync = async () => {
     try {
          await fs.unlink(filePath);
          console.log("File deleted successfully!");
     } catch (error) {
          console.error("Error Deleting File:", error.message);
     }
}
