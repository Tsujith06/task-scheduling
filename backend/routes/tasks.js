const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

router.get('/', async (req, res) => {
    try {
        const { cat, epic, priority, status, search } = req.query;
        let query = {};
        if (cat && cat !== 'All') query.cat = cat;
        if (epic && epic !== 'All') query.epic = epic;
        if (priority && priority !== 'All') query.priority = priority;
        if (status) query.status = status;
        if (search) query.title = { $regex: search, $options: 'i' };

        const tasks = await Task.find(query).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch tasks' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const saved = await newTask.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ status: 'error', message: 'Failed to create task' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ status: 'error', message: 'Failed to update task' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ status: 'success', id: req.params.id });
    } catch (err) {
        res.status(400).json({ status: 'error', message: 'Failed to delete task' });
    }
});

module.exports = router;
