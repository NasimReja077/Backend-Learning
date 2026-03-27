// services/image.service.js
import Tesseract from "tesseract.js";

export const extractImageText = async (filePath) => {
  const { data } = await Tesseract.recognize(filePath, "eng");
  return data.text;
};