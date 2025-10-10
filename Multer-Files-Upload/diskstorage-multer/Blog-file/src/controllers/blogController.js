import Blog from '../models/Blog.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middlewares/upload.js';
import { CLOUDINARY_FOLDERS } from '../utils/cloudinary.js';

export const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    const thumbnail = req.files?.thumbnail?.[0];
    const contentImages = req.files?.contentImages || [];

    if (!thumbnail) {
      return res.status(400).json({ message: 'Thumbnail is required' });
    }

    // Upload thumbnail
    const thumbnailData = await uploadToCloudinary(thumbnail, CLOUDINARY_FOLDERS.BLOG_THUMBNAILS);

    // Upload content images
    const contentImagesData = await Promise.all(
      contentImages.map(file => uploadToCloudinary(file, CLOUDINARY_FOLDERS.BLOG_CONTENT))
    );

    // Create blog
    const blog = new Blog({
      title,
      content,
      thumbnail: thumbnailData,
      contentImages: contentImagesData,
      author: req.user._id,
    });

    await blog.save();
    res.redirect('/blogs');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Delete thumbnail from Cloudinary
    if (blog.thumbnail?.publicId) {
      await deleteFromCloudinary(blog.thumbnail.publicId);
    }

    // Delete content images from Cloudinary
    if (blog.contentImages?.length) {
      await Promise.all(
        blog.contentImages.map(image => deleteFromCloudinary(image.publicId))
      );
    }

    // Delete blog from database
    await blog.deleteOne();
    res.redirect('/blogs');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};