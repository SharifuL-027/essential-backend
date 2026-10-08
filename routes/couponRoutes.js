const express = require('express');
const router = express.Router();
const { createCoupon, verifyCoupon, getCoupons, deleteCoupon } = require('../controllers/couponController');

router.route('/')
    .post(createCoupon)
    .get(getCoupons);


router.get('/:code', verifyCoupon);

// অ্যাডমিন রাউট (কুপন ডিলিট করা)
router.delete('/:id', deleteCoupon);

module.exports = router;