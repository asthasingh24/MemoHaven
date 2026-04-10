const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const auth = require('../middleware/auth');

// GET: Fetch all places for the family
router.get('/', auth, async (req, res) => {
  try {
    const places = await Place.find({ familyCode: req.user.familyCode });
    res.json(places);
  } catch (err) { res.status(500).send('Server Error'); }
});

// POST: Add a new place (Caregiver Only)
router.post('/', auth, async (req, res) => {
  try {
    const newPlace = new Place({
      name: req.body.name,
      description: req.body.description,
      lat: req.body.lat,
      lng: req.body.lng,
      type: req.body.type,
      familyCode: req.user.familyCode
    });
    const saved = await newPlace.save();
    res.json(saved);
  } catch (err) { res.status(500).send('Server Error'); }
});

// DELETE: Remove place
router.delete('/:id', auth, async (req, res) => {
  try {
    await Place.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;