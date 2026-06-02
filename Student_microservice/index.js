// student-service/index.js
const express = require('express');
const verifyToken = require('./authMiddleware');

const app = express();
app.use(express.json());

// GET — View Assignment (Protected: Any logged-in user with a valid token can view)
app.get('/student/viewassignment', verifyToken('student'), (req, res) => {
  res.json({ 
    message: 'viewassignment works! Passport verified cleanly.',
    userId: req.user.id,
    yourRole: req.user.role
  });
});

// PUT — Update Student Profile (Protected: Any logged-in user can access)
app.put('/student/studentupdateprofile', verifyToken(), (req, res) => {
  res.json({ 
    message: 'studentupdateprofile works! Profile updated successfully.',
    userId: req.user.id
  });
});

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`Student microservice running securely on port ${PORT}`);
});