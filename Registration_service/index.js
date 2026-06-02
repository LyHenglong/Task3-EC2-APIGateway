const express = require('express');
require('dotenv').config();

const connectDB = require('./dbconnect');
const User      = require('./userSchema');

const app  = express();
// Changed fallback port to 5001 to align with the API Gateway routing map
const PORT = process.env.PORT || 5001; 

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ─── REMOVED: hashPassword function has been deleted to support plain text ───

// ─── Routes ──────────────────────────────────────────────────────────────────

// @route   GET /
// @desc    Health check (Helps verify the gateway can reach this microservice)
app.get('/', (req, res) => {
  res.json({ message: 'Registration Microservice is running securely on Port 5001 🚀' });
});

// @route   POST /register/register
// @desc    Register a new user
app.post('/register/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'fullName, email, password, and role (student/teacher) are required.',
      });
    }

    // Validate that the role is either student or teacher
    if (role !== 'student' && role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be either "student" or "teacher".',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    // Create user with raw plain text password and normalized strings
    const newUser = new User({
      fullName,
      email: email.toLowerCase().trim(),
      password: password, // SAVED AS PLAIN TEXT
      role: role.toLowerCase().trim(),
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      data: {
        id:       newUser._id,
        fullName: newUser.fullName,
        email:    newUser.email,
        role:     newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   GET /users
// @desc    Get all registered users (Includes plain text password now for clear assignment debugging)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`=====> Registration Microservice active on http://localhost:${PORT} <=====`);
});