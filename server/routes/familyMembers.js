const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FamilyMember = require('../models/FamilyMember');
const multer = require('multer');
const { storage } = require('../config/cloudinary'); // Use your existing Cloudinary config

const upload = multer({ storage });

// @route   POST api/familyMembers
router.post('/', [auth, upload.single('media')], async (req, res) => {
  try {
    const { name, relation } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a photo' });
    }

    const newMember = new FamilyMember({
      name,
      relation,
      imageUrl: req.file.path, // URL from Cloudinary
      familyCode: req.user.familyCode // Master Key from caregiver's token
    });

    const savedMember = await newMember.save();
    res.json(savedMember);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/familyMembers
router.get('/', async (req, res) => {
  try {
    const familyCode = req.query.familyCode;
    if (!familyCode) return res.status(400).json({ msg: "No family code provided" });

    const members = await FamilyMember.find({ familyCode });
    res.json(members);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});
// DELETE: Remove a Family Member
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await FamilyMember.findById(req.params.id);
    if (!member) return res.status(404).json({ msg: 'Member not found' });

    // Security check
    if (member.familyCode !== req.user.familyCode) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await FamilyMember.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Member deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;