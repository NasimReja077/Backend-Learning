import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    throw new ApiError(422, messages[0], errors.array());
  }
  next();
};
