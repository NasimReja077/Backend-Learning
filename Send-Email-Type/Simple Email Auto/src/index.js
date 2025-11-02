// index.js
import express from "express";
import dotenv from "dotenv";
import { sendWelcomeMail } from "./services/sendMailService.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, async() =>{
     console.log(`Server running on port ${PORT} 🔥`);
     if (process.env.TO_TEST_EMAIL) {
          console.log("Auto Sending welcome email...");
          await sendWelcomeMail(process.env.TO_TEST_EMAIL);
     } else {
          console.log("Error... No TO_EMAIL found in .env file")
     }
});