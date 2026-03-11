const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    sid: { type: String }, // General ID (Reg No or Emp ID)
    dept: { type: String },
    team: { type: String },
    role: { type: String, enum: ['Student', 'Mentor', 'Admin'], default: 'Student' },
    contact: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    avatar: { type: String },
    lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
