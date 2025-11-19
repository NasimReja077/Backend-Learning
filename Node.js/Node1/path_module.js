import path from "path";

console.log(__dirname); // Current directory
console.log(__filename); // Current file


const filePath = path.join("folder", "subfolder", "file.txt");
console.log("File Path:", filePath);

const parsData = path.parse(filePath);
const resolvedPath2 = path.relative(filePath);
const extname = path.extname(filePath);
const basename = path.basename(filePath);
const dirname = path.dirname(filePath);
console.log({parsData, resolvedPath2, extname, basename, dirname});


// Join paths
const joinedPath = path.join(__dirname, "subdir", "file.txt");
console.log("Joined Path:", joinedPath);

// Resolve paths
const resolvedPath = path.resolve("subdir", "file.txt");
console.log("Resolved Path:", resolvedPath);