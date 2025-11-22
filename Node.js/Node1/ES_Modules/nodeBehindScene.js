import fs from 'fs';

// Synchronous task 
console.log("Start");

// Synchronous task
const data = fs.readFileSync('example.txt', 'utf8');
console.log("Sync File content:", data); 

// Asynchronous task
fs.readFileSync('example2.txt', 'utf8', (err, data)=>{
     if (err) throw err;
     console.log("Async File content:", data);
});

// Synchronous task 
console.log("End");

// import fs from 'fs';
// import path, { dirname } from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Synchronous task
// const data = fs.readFileSync(path.join(__dirname, 'example.txt'), 'utf8');
// console.log("Sync File content:", data);

// // Synchronous task with try/catch (was labeled Asynchronous)
// try {
//     const data2 = fs.readFileSync(path.join(__dirname, 'example2.txt'), 'utf8');
//     console.log("Sync File content:", data2);
// } catch (err) {
//     console.error("Error reading file:", err);
// }

// // Synchronous task
// console.log("Start");




// How Node.js Works-> V8 Engine, Event Loop,Threads Explained!
/**
 * firstly, Node.js uses the V8 engine to compile JavaScript code into machine code, enabling fast execution. When a Node.js application runs, it operates on a single thread using an event-driven architecture. The event loop is central to this model, allowing Node.js to handle multiple operations concurrently without blocking the main thread. When an asynchronous operation (like I/O tasks) is initiated, Node.js offloads it to the system kernel or a thread pool (managed by libuv). Once the operation completes, a callback is placed in the event queue. The event loop continuously checks this queue and processes callbacks when the main thread is free, ensuring efficient execution of tasks.

Worker threads can be used for CPU-intensive tasks, allowing these operations to run in parallel without blocking the event loop. This combination of V8, the event loop, and worker threads allows Node.js to handle high concurrency with minimal overhead.

 
 */