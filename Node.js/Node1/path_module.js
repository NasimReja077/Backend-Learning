import path from "path";

console.log(__dirname); // Current directory
console.log(__filename); // Current file

// Join paths
const joinedPath = path.join(__dirname, "subdir", "file.txt");
console.log("Joined Path:", joinedPath);

// Resolve paths
const resolvedPath = path.resolve("subdir", "file.txt");
console.log("Resolved Path:", resolvedPath);