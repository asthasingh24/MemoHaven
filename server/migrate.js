const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const Memory = require('./models/Memory');
    const User = require('./models/User');
    
    const user = await User.findOne({ role: 'caregiver' });
    if (!user) {
      console.log('No caregiver found');
      process.exit(1);
    }
    
    console.log('Found user:', user.name, 'familyCode:', user.familyCode);
    
    const result = await Memory.updateMany(
      { $or: [{ familyCode: { $exists: false } }, { familyCode: null }] },
      { $set: { familyCode: user.familyCode } }
    );
    
    console.log('Updated', result.modifiedCount, 'memories');
    const count = await Memory.countDocuments({ familyCode: user.familyCode });
    console.log('Total memories for this family:', count);
    
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
