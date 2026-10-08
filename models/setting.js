const mongoose = require('mongoose');

const settingSchema = mongoose.Schema(
  {
    insideDhaka: {
      type: Number,
      required: true,
      default: 60, // ডিফল্ট ৬০ টাকা
    },
    outsideDhaka: {
      type: Number,
      required: true,
      default: 120, // ডিফল্ট ১২০ টাকা
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;