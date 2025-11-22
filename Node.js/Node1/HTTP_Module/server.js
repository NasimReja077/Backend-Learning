import http from 'http';
const server = http.createServer((req, res) =>{
     if(req.url === '/'){
          res.write("Hello from the Home Page");
          res.end(); // send the response
     }

     if(req.url === '/src'){
          res.write("Hello from the Source Page. Okay I am learning Node.js");
          res.end(); // send the response
     }

     if(req.url === '/contact'){
          res.setHeader("Content-Type", "text/html");
          res.write("<h1>Contact Page</h1>");
          res.write("<p>This is the contact page</p>");
          res.end(); // send the response
     }
});
// behaind the scine
// server.emit
// server.addListener


const PORT = 3000;
server.listen(PORT, () => {
     console.log(`Server is Listening on PORT ${PORT}`);
});

// for automatic restart use nodemon
// npm install -g nodemon
// nodemon server.js

// to run without nodemon use
// node --watch .\server.js
































