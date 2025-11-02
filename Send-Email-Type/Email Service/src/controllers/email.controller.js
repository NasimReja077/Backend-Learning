// email.controller.js

import { sendWelcomeMail } from "../services/sendMailService.js"

export const sendTestMail = async(req, res)=>{
     const { email } = req.body;
     if(!email)
          return res.status(400).json({ success: false, message: "Email is Required"});
     
     const response = await sendWelcomeMail(email);
     if(response.success)
          res.status(200).json({ success: true, message: "Welcome mail sent"});
     else
          res.status(500).json({ success: false, message: response.error});
};