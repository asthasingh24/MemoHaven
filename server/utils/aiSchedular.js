const cron = require('node-cron');
// Mock Database Check
const checkRoutine = () => {
    console.log("AI SYSTEM: Checking patient activity logs...");
    const currentHour = new Date().getHours();
    
    // Logic: If it is 9 AM and 'Morning Meds' not marked done
    if (currentHour === 9) {
        console.log("ALERT: Generating reminder for Medication.");
        // In a real app, you would emit a Socket.io event here
    }
};

// Run check every hour
const startAI = () => {
    cron.schedule('0 * * * *', checkRoutine);
};

module.exports = startAI;