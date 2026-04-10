const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  time: {
    type: String, // Storing as string "09:00" is fine for this use case
    required: true
  },
  isCompleted: { 
    type: Boolean, 
    default: false 
  },
  familyCode: { 
    type: String, 
    required: true // Links this task to the specific family
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Routine', RoutineSchema);
