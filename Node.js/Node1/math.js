const add = (a, b) =>{
     return a + b;
};

const subs = (a, b) =>{
     return a - b;
};

const mult = (a, b) =>{
     return a * b;
};

const div = (a, b) => {
     return a / b;
}


// module.exports = add;
// export default add;

export default {add, subs, mult, div};

/**
 * module.exports is a single object or value that a module returns when it is required in another file.
 * In contrast, exports is a shorthand reference to module.exports, allowing you to add multiple properties or methods to the exports object.
 * 
 * when you reassign module.exports (e.g., module.exports = add;), it completely replaces whatever was previously assigned to exports.
 * If you reassing it again (module.exports = { subtract };), it will overwrite the previous assignment.
 * 
 * If you use exports to add properties or methods (e.g., exports.multiply = multiply;), it modifies the exports object without replacing module.exports entirely.
 * 
 * In summary, use module.exports when you want to export a single value or object, and use exports when you want to add multiple properties or methods to the exported object.
 */

