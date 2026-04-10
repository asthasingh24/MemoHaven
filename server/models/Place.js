const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },     // e.g. "Home"
  description: String,                        // e.g. "123 Main St"
  lat: { type: Number, required: true },      // Latitude
  lng: { type: Number, required: true },      // Longitude
  type: { type: String, default: 'general' }, // e.g. 'home', 'medical'
  familyCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Place', PlaceSchema);