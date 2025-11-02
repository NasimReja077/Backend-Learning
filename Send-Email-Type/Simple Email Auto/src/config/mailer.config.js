//  mailer.config.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
// const EMAIL_PASS = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

export const transporter = nodemailer.createTransport({
     host: "smtp.ethereal.email",
     secure: false,
     port: 587, // must add
     auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
     },
});
