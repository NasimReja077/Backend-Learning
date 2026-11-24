import jwt from "jsonwebtoken";
import { getSecret } from "../config/secrets.js";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const decoded = jwt.verify(token, getSecret("JWT_SECRET"));

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

export default authMiddleware;