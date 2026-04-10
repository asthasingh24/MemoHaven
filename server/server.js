require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize App
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/memories', require('./routes/memories'));
app.use('/api/routines', require('./routes/routines'));
app.use('/api/places', require('./routes/places')); 
app.use('/api/familyMembers', require('./routes/familyMembers'));
app.use('/api/emergency', require('./routes/emergency'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));