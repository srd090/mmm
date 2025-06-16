// models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  idNumber: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  newphoneNumber: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

// Optional: Index for faster duplicate checking
applicationSchema.index({ idNumber: 1, submittedAt: 1 });

module.exports = mongoose.model('Application', applicationSchema);
