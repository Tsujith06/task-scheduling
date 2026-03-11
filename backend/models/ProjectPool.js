const mongoose = require('mongoose');

const projectPoolSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    domain: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProjectPool', projectPoolSchema);
