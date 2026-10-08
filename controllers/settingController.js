const Setting = require('../models/setting');

// @desc    Get delivery settings
// @route   GET /api/v1/settings/delivery
// @access  Public
const getDeliverySettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    // যদি ডাটাবেসে কোনো সেটিং না থাকে, তবে ডিফল্ট একটা তৈরি করে নেব
    if (!settings) {
      settings = await Setting.create({ insideDhaka: 60, outsideDhaka: 120 });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

// @desc    Update delivery settings
// @route   PUT /api/v1/settings/delivery
// @access  Private/Admin
const updateDeliverySettings = async (req, res) => {
  try {
    const { insideDhaka, outsideDhaka } = req.body;
    let settings = await Setting.findOne();

    if (settings) {
      settings.insideDhaka = insideDhaka || settings.insideDhaka;
      settings.outsideDhaka = outsideDhaka || settings.outsideDhaka;
      await settings.save();
    } else {
      settings = await Setting.create({ insideDhaka, outsideDhaka });
    }
    res.status(200).json({ success: true, data: settings, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

module.exports = { getDeliverySettings, updateDeliverySettings };