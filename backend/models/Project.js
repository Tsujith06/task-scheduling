const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Internal Project ID
    name: { type: String }, // Selected title
    teamName: { type: String, required: true },
    description: { type: String },
    abstract: { type: String },
    srsUrl: { type: String },
    rejectionReason: { type: String },
    status: {
        type: String,
        enum: ['Formation', 'MentorSelection', 'ProposalSubmission', 'PendingApproval', 'Approved', 'Rejected'],
        default: 'Formation'
    },
    objectives: [String],
    milestones: [{
        label: { type: String, required: true },
        pct: { type: Number, default: 0 },
        color: { type: String, default: '#6015C1' },
        status: { type: String, enum: ['Done', 'Active', 'Pending'], default: 'Pending' }
    }],
    mentor: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        dept: { type: String }
    },
    teamLead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{
        name: { type: String, required: true },
        email: { type: String },
        sid: { type: String },
        dept: { type: String },
        role: { type: String },
        status: { type: String, enum: ['Present', 'Absent', 'Late', 'Pending'], default: 'Present' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
