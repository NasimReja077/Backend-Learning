/**
 * What is a Module in Node.js?
Modules are the building blocks of Node.js applications, allowing you to organize code into logical, reusable components. They help in:

Organizing code into manageable files
Encapsulating functionality
Preventing global namespace pollution
Improving code maintainability and reusability
Node.js supports two module systems: CommonJS (traditional) and ES Modules (ECMAScript modules).

This page covers CommonJS, while ES Modules are covered separately.
 */

/**
 * Core Built-in Modules
 * fs - File system operations
http - HTTP server and client
path - File path utilities
os - Operating system utilities
events - Event handling

util - Utility functions
stream - Stream handling
crypto - Cryptographic functions
url - URL parsing
querystring - URL query string handling
 */

// const add = require("./math.js");
// import add from "./math.js";
import {add, subs, mult, div} from ("./math.js");
console.log(add(5, 10));
console.log(mult(5, 10));
console.log(subs(5, 10));
console.log(div(5, 10));
