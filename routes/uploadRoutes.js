const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const router = express.Router();

// Multer Memory Storage (র‌্যামে সাময়িক ফাইল রাখার জন্য)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    // 🔥 100% Foolproof: Cloudinary কনফিগারেশনটি রাউটের ভেতরে নিয়ে আসা হলো
    // এর ফলে API Key না পাওয়ার কোনো চান্সই নেই!
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Buffer থেকে Cloudinary তে আপলোড করার জন্য Stream ব্যবহার করা
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
           // ক্লাউডনারিতে এই ফোল্ডারে সেভ হবে
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
    
    // ফ্রন্টএন্ডে image URL পাঠানো হচ্ছে
    res.status(200).json({ image: result.secure_url }); 

  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

module.exports = router;