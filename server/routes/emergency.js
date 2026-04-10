const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const auth = require('../middleware/auth');
const User = require('../models/User'); // 🌟 NEW: Import User model

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// @route   POST api/emergency/alert
router.post('/alert', auth, async (req, res) => {
  try {
    // 1. Find the master Caregiver for this specific family
    const caregiver = await User.findOne({ 
      familyCode: req.user.familyCode, 
      role: 'caregiver' 
    });

    // 2. Safety check: Did they set a number?
    if (!caregiver || !caregiver.emergencyPhone) {
      return res.status(400).json({ error: "Caregiver has not set an emergency phone number yet." });
    }

    const patientName = req.body.patientName || 'A patient';

    // 3. Send the SMS to the Caregiver's dynamically pulled number
    const message = await client.messages.create({
      body: `🚨 EMERGENCY ALERT: ${patientName} has pressed the SOS button in MemoHaven. Please check on them immediately.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: caregiver.emergencyPhone // 🌟 NEW: Pulled directly from MongoDB
    });

    console.log("SMS sent successfully. SID:", message.sid);
    res.json({ success: true, msg: "Alert sent to caregiver." });
    
  } catch (error) {
    console.error("Twilio Error:", error.message);
    res.status(500).json({ error: 'Failed to send SMS alert' });
  }
});

module.exports = router;