const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role:     { type: String, required: true, lowercase: true, enum: ['student', 'teacher'] }
  },
  { timestamps: true }
);

// CHANGED THIS LINE: 
// Changing 'User' to 'person_collection' forces Mongoose to write to that exact collection!
module.exports = mongoose.model('person_collections', userSchema);