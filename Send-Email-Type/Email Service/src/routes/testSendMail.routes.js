// testSendMail.routes.js
import express from "express";
import { sendTestMail } from "../controllers/email.controller.js";

const router = express.Router();

router.post("/sendMail", sendTestMail);
export default router;
