const express = require('express');
const router = express.Router();
const ReviewPhase = require('../models/ReviewPhase');
const Project = require('../models/Project');
const ProjectPool = require('../models/ProjectPool');
const Task = require('../models/Task');

router.get('/', async (req, res) => {
    try {
        const phases = await ReviewPhase.find().sort({ title: 1 });
        res.json(phases);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch phases' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newPhase = new ReviewPhase(req.body);
        const saved = await newPhase.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await ReviewPhase.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await ReviewPhase.findByIdAndDelete(req.params.id);
        res.json({ message: 'Phase deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

router.put('/:id/start', async (req, res) => {
    try {
        const phase = await ReviewPhase.findById(req.params.id);
        if (!phase) return res.status(404).json({ message: 'Phase not found' });
        
        // Update phase status
        phase.status = 'Ongoing';
        await phase.save();
        
        // Find all projects
        const projects = await Project.find();
        
        // Fetch project pools to map domains
        const projectPools = await ProjectPool.find();
        const domainMap = {};
        projectPools.forEach(p => domainMap[p.title] = p.domain);
        
        const tasksToSave = [];
        
        for (const project of projects) {
            // Find project domain
            const projectDomain = domainMap[project.name] || 'General';
            
            // Find targets for this domain (or General)
            const targets = phase.targets.filter(t => 
                (t.domain || 'AI') === projectDomain || 
                (t.domain || 'AI') === 'General'
            );
            
            for (const target of targets) {
                // Create task for every team member
                for (const member of project.members) {
                    tasksToSave.push({
                        title: target.title,
                        desc: target.description,
                        cat: 'Development', // Standard category
                        epic: phase.title, // Phase Name as Epic
                        priority: 'High',
                        status: 'To-Do',
                        assignee: member.name,
                        assignedBy: 'Administrator',
                        deadline: phase.endDate || Date.now()
                    });
                }
            }
        }
        
        if (tasksToSave.length > 0) {
            await Task.insertMany(tasksToSave);
        }
        
        res.json({ 
            message: 'Phase started and tasks created for ' + projects.length + ' teams.', 
            count: tasksToSave.length 
        });
    } catch (err) {
        console.error("Start phase error:", err);
        res.status(500).json({ message: 'Failed to start phase and sync tasks' });
    }
});

module.exports = router;
