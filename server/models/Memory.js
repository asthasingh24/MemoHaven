const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
  title: String,
  tags: [String],
  mediaUrl: String,
  type: { type: String, default: 'image' }, 
  date: { type: Date, default: Date.now },
  familyCode: { type: String, required: true }
});

module.exports = mongoose.model('Memory', MemorySchema);