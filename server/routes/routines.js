const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const auth = require('../middleware/auth'); // Protected routes require login

// GET: Fetch all routines for the logged-in user's family
router.get('/', auth, async (req, res) => {
  try {
    // Only find tasks that match the familyCode of the user (Patient or Caregiver)
    const routines = await Routine.find({ familyCode: req.user.familyCode }).sort({ time: 1 });
    res.json(routines);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST: Add a new task (Caregiver Only logic is handled on frontend, backend just checks valid user)
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }
    const newRoutine = new Routine({
      title: req.body.title,
      time: req.body.time,
      familyCode: req.user.familyCode // Automatically tag with the user's family code
    });

    const savedRoutine = await newRoutine.save();
    res.json(savedRoutine);
  } catch (err) {
    console.error('POST /routines error:', err.message);
    res.status(500).json({ msg: err.message });
  }
});

// PUT: Toggle completion status (Patient can do this)
router.put('/:id', auth, async (req, res) => {
  try {
    let routine = await Routine.findById(req.params.id);

    if (!routine) return res.status(404).json({ msg: 'Task not found' });

    // Security: Ensure task belongs to user's family
    if (routine.familyCode !== req.user.familyCode) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Toggle the boolean
    routine.isCompleted = !routine.isCompleted;
    
    await routine.save();
    res.json(routine);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE: Remove a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) return res.status(404).json({ msg: 'Task not found' });

    // Security check
    if (routine.familyCode !== req.user.familyCode) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Routine.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;