
const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: String,
  code: String, // The simple login code (e.g. "JOE")
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['caregiver', 'patient'], default: 'caregiver' },
  
  // The Master Key linking memories
  familyCode: { type: String, required: true },
  // 🌟 NEW: Store the caregiver's verified Twilio number
  emergencyPhone: { type: String, default: '' },

  // List of patients managed by this caregiver
  patients: [PatientSchema] 
});

module.exports = mongoose.model('User', UserSchema);