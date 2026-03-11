const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    teamId: { type: String, required: true },
    teamName: { type: String, required: true },
    inviterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inviterName: { type: String, required: true },
    invitedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invitedUserName: { type: String },
    invitedUserEmail: { type: String },
    invitedUserSid: { type: String },
    invitedUserDept: { type: String },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    message: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invitation', invitationSchema);
