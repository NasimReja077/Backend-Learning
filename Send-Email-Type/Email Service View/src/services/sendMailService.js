// sendMailService.js

import { transporter } from "../config/mailer.config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendWelcomeMail = async (toEmail) => {
     const templatePath = path.join(__dirname, "../views/welcome.html");
     const htmlTemplate = fs.readFileSync(templatePath, "utf-8");
     try {
          const info = await transporter.sendMail({
               from: `"MyApp Team" <${process.env.EMAIL_USER}>`,
               to: toEmail,
               subject: `🎉 Test Welcome Mail`,
               html: htmlTemplate,
          });
          
          console.log("Email Sent Successfully:", info.messageId);
          return { success: true };
     } catch (error) {
          console.error("Email sending failed:", error.message);
          return { success: false, error: error.message };
     }
};