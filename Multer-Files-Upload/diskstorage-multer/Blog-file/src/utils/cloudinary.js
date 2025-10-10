import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_FOLDERS = {
  AVATARS: 'blog_app/users/avatars',
  COVERS: 'blog_app/users/covers',
  BLOG_THUMBNAILS: 'blog_app/blogs/thumbnails',
  BLOG_CONTENT: 'blog_app/blogs/content',
};

export default cloudinary;