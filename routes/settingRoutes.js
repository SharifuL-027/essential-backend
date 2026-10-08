const express = require('express');
const router = express.Router();
const { getDeliverySettings, updateDeliverySettings } = require('../controllers/settingController');

// 🔥 তোমার সঠিক মিডলওয়্যার ইম্পোর্ট করা হলো
const { protect, adminOnly } = require('../middleware/authMiddleware'); // পাথ ঠিক আছে কি না চেক করে নিও

router.route('/delivery')
  .get(getDeliverySettings) // যে কেউ ডেলিভারি চার্জ দেখতে পারবে
  .put(protect, adminOnly, updateDeliverySettings); // শুধুমাত্র লগ-ইন করা অ্যাডমিন আপডেট করতে পারবে

module.exports = router;