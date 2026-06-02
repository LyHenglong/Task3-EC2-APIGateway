const express = require('express');
const crypto  = require('crypto'); // Kept exclusively for native JWT signing
require('dotenv').config();

const connectDB = require('./dbconnect');
const User      = require('./userSchema'); // Uses your clean, unified userSchema

const app  = express();
const PORT = process.env.PORT || 5002; 

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ─── JWT Helper (Generates standard compatible JWT strings natively) ─────────
function base64urlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateJWT(payload) {
  const secret  = process.env.JWT_SECRET || 'your_jwt_secret_key';
  const header  = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body    = base64urlEncode(JSON.stringify({ 
    ...payload, 
    iat: Math.floor(Date.now() / 1000), 
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 
  }));
  const sig     = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${header}.${body}.${sig}`;
}

// ─── REMOVED: verifyPassword cryptographic helper functions deleted ──────────

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({ message: 'Authentication Microservice running securely on Port 5002 🔐' });
});

// @route   POST /login/login
// @desc    Authenticate user against 'users' collection cleanly
app.post('/login/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // 1. Explicitly pulls from the clean collection via normalized userSchema keys
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // 2. CHANGED: Performs a direct plain-text string comparison matching Registration
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // 3. Generate JWT Passport
    const token = generateJWT({
      id:    user._id,
      email: user.email,
      role:  user.role, 
    });

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id:       user._id,
        fullName: user.fullName,
        email:    user.email,
        role:     user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`=====> Authentication Microservice active on http://localhost:${PORT} <=====`);
});