const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    desc: { type: String },
    cat: { type: String, required: true }, // Category
    epic: { type: String },
    priority: { type: String, enum: ['Highest', 'High', 'Medium', 'Low'], default: 'Medium' },
    status: { type: String, enum: ['To-Do', 'In Progress', 'Completed'], default: 'To-Do' },
    assignmentStatus: { type: String, enum: ['Pending', 'Accepted', 'Rescheduled'], default: 'Pending' },
    rescheduleReason: { type: String },
    assignee: { type: String }, // Can be user name or Ref to User ID
    assignedBy: { type: String },
    flagged: { type: Boolean, default: false },
    deadline: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
