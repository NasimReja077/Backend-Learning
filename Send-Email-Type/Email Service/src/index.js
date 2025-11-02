// index.js
import express from "express";
import dotenv from "dotenv";
import testSendMail from './routes/testSendMail.routes.js'

dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/test", testSendMail);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
     console.log(`Server running on port ${PORT} 🔥`)
});