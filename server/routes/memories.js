const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const upload = require('../config/cloudinary'); 
const auth = require('../middleware/auth');
const multer = require('multer');

// POST: Upload Memory (Photo/Video)
router.post('/', auth, (req, res) => {
  const uploadSingle = upload.single('media');

  uploadSingle(req, res, async function (err) {
    // 1. Check for File Size Errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ msg: 'File is too large. Max limit is 10MB.' });
      }
      return res.status(500).json({ msg: err.message });
    } else if (err) {
      console.error("CLOUDINARY REJECTION DETAILS:", err);
      return res.status(500).json({ msg: `Cloudinary Error: ${err.message}` });
    }

    try {
      if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

      // 2. Detect if Photo or Video
      let mediaType = 'image';
      if (req.file.mimetype.startsWith('video')) {
          mediaType = 'video';
      }else if (req.file.mimetype.startsWith('audio')) {
          mediaType = 'audio'; // 🎙️ Flag as Voice Note
      }

      const title = req.body.title || 'Untitled Memory';
      const tagsString = req.body.tags || '';

      // 3. Save to Database directly
      const newMemory = new Memory({
        title: title,
        tags: tagsString.split(',').map(t => t.trim()).filter(t => t),
        mediaUrl: req.file.path,
        type: mediaType,
        familyCode: req.user.familyCode
      });

      const saved = await newMemory.save();
      res.json(saved);
    } catch (dbErr) {
      console.error("DATABASE ERROR:", dbErr);
      res.status(500).json({ msg: `Database Error: ${dbErr.message}` });
    }
  });
});

// GET: Fetch Memories
router.get('/', auth, async (req, res) => {
  try {
    const memories = await Memory.find({ familyCode: req.user.familyCode }).sort({ date: -1 });
    res.json(memories);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// DELETE: Remove a Memory (Photo/Video)
router.delete('/:id', auth, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ msg: 'Memory not found' });
    
    // Security check: Ensure the memory belongs to this family
    if (memory.familyCode !== req.user.familyCode) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    const publicId = getPublicIdFromUrl(memory.mediaUrl);
    if (publicId) {
      // 🌟 NEW: Cloudinary requires 'video' resource type to delete audio files!
      const resourceType = (memory.type === 'video' || memory.type === 'audio') ? 'video' : 'image';
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }

    await Memory.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Memory deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;