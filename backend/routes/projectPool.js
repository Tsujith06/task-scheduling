const express = require('express');
const router = express.Router();
const ProjectPool = require('../models/ProjectPool');

// Get all project titles
router.get('/', async (req, res) => {
    try {
        const pool = await ProjectPool.find().sort({ title: 1 });
        res.json(pool);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin adds a project
router.post('/', async (req, res) => {
    try {
        const project = new ProjectPool(req.body);
        const saved = await project.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Admin updates a project
router.put('/:id', async (req, res) => {
    try {
        const updated = await ProjectPool.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Admin deletes a project
router.delete('/:id', async (req, res) => {
    try {
        await ProjectPool.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project title deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
