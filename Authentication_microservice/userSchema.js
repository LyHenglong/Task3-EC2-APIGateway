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

// MUST match Registration's collection name exactly so both services share the same data
module.exports = mongoose.model('person_collections', userSchema);
