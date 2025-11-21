// Import EventEmitter class 
import EventEmitter from 'events';

// // Create an instance of EventEmitter
// const emitter = new EventEmitter();

// // 1. Define an event listener (addListener)
// emitter.on("greet", () => {
//      console.log("Hello, Nasim !");
// });



// emitter.on("greet", (username, prof)=>{
//      console.log(`Hello,${username} !I am a ${prof}, ri8`);
// });
// // 2. Trigger (emit) the "greet" event
// emitter.emit("greet", "Nasim !", "Developer");


emitter.on("greet", (arg)=>{
     console.log(`Hello,${arg.username} !I am a ${arg.prof}, ri8`);
});
// 2. Trigger (emit) the "greet" event
emitter.emit("greet", {username: "Nasim", prof: "Developer"});


