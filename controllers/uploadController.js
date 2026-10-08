const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Cloudinary Config

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Multer Memory Storage (র্যামে সাময়িক ফাইল রাখার জন্য)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Endpoint Function
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Buffer থেকে Cloudinary তে আপলোড করার জন্য Stream ব্যবহার করা
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'essential-bd-products' }, // ক্লাউডনারিতে ফোল্ডারের নাম
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const result = await streamUpload(req);
    res.status(200).json({ url: result.secure_url }); // ক্লাউডনারির ফাইনাল ইমেজ লিংক রিটার্ন করবে

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
};

module.exports = { upload, uploadImage };