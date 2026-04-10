const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Ensure you have the middleware file

// 1. REGISTER CAREGIVER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, familyCode } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password, role, familyCode });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Payload includes familyCode
    const payload = { user: { id: user.id, role: user.role, familyCode: user.familyCode } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, familyCode: user.familyCode } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. LOGIN CAREGIVER
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id, role: user.role, familyCode: user.familyCode } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, familyCode: user.familyCode } });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 3. ADD PATIENT (Caregiver Only)
router.post('/add-patient', auth, async (req, res) => {
  try {
    const { name, code } = req.body;
    
    // Check global uniqueness of the simple code
    const codeExists = await User.findOne({ "patients.code": code });
    if (codeExists) return res.status(400).json({ msg: "This Code is already taken. Try another." });

    const user = await User.findById(req.user.id);
    user.patients.push({ name, code });
    await user.save();
    
    res.json(user.patients);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 4. GET MY PATIENTS
router.get('/my-patients', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.patients);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 5. SIMPLE PATIENT LOGIN (One Step)
router.post('/patient-login', async (req, res) => {
  try {
    const { familyCode } = req.body; // In this context, this is the PATIENT CODE (e.g. "JOE")

    // Find the caregiver who owns this patient code
    const caregiver = await User.findOne({ "patients.code": familyCode });
    if (!caregiver) return res.status(400).json({ msg: 'Invalid Login Code' });

    // Find patient details
    const patient = caregiver.patients.find(p => p.code === familyCode);

    // Create Token: MAGIC HAPPENS HERE
    // We give the patient the CAREGIVER'S master familyCode so they can see the photos
    const payload = { 
      user: { 
        id: 'guest_patient', 
        role: 'patient', 
        familyCode: caregiver.familyCode // <--- Access to Caregiver's Vault
      } 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '3650d' }); // 10 Year Token

    res.json({ token, user: { name: patient.name, role: 'patient', familyCode: caregiver.familyCode } });
    
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// POST: Update Caregiver Emergency Phone
router.post('/update-phone', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Only caregivers should have an emergency phone routing number
    if (user.role !== 'caregiver') {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    user.emergencyPhone = req.body.phone;
    await user.save();
    
    res.json({ msg: 'Emergency phone updated successfully', phone: user.emergencyPhone });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;