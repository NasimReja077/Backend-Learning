// sendMailService.js

import { transporter } from "../config/mailer.config.js";

const welcomeTemplate = () => `
     <div style="font-family:Arial, sans-serif; padding:20px; background-color:#f4f4f4;">
          <h2 style="color:#4CAF50;">Welcome to MyBlog App. This is Automatic Test Email 🎉</h2>
          <p>Explore our platform and enjoy your journey with us.</p>
     </div>
`;

export const sendWelcomeMail = async (toEmail) => {
     try {
          const info = await transporter.sendMail({
               from: `"MyApp Team" <${process.env.EMAIL_USER}>`,
               to: toEmail,
               subject: `🎉 Automatic Test Welcome Mail`,
               html: welcomeTemplate(),
          });

          console.log("Email Sent Successfully:", info.messageId);
          return info;
     } catch (error) {
          console.error("Email sending failed:", error.message);
          throw error;
     }
};