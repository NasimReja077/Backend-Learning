import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, folder = "flixora/avatars") => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }],
  });
  return result;
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;