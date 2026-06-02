// teacher-service/index.js
const express = require('express');
const verifyToken = require('./authMiddleware');

const app = express();
app.use(express.json());

// GET — View Teacher Dashboard (Strictly Protected: ONLY accessible if role === 'teacher')
app.get('/teacher/dashboard', verifyToken('teacher'), (req, res) => {
  res.json({ 
    message: 'Welcome Professor! Teacher dashboard loaded securely.',
    teacherId: req.user.id,
    yourRole: req.user.role
  });
});

// POST — Review/Grade Assignment (Strictly Protected: ONLY accessible if role === 'teacher')
app.post('/teacher/grade-assignment', verifyToken('teacher'), (req, res) => {
  res.json({ 
    message: 'Assignment graded successfully!' 
  });
});

const PORT = 5004;
app.listen(PORT, () => {
  console.log(`Teacher microservice running securely on port ${PORT}`);
});