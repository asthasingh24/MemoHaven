const mongoose = require('mongoose');

const FamilyMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  imageUrl: { type: String, required: true },
  familyCode: { type: String, required: true }, // Links it to the specific family
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FamilyMember', FamilyMemberSchema);