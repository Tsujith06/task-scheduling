const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const GlobalSettings = require('../models/GlobalSettings');

router.get('/', async (req, res) => {
    try {
        const { role, search, availableMentors } = req.query;
        let query = role ? { role } : {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        let users = await User.find(query).sort({ name: 1 }).lean();

        // Check if students are already in a team
        if (role === 'Student' || !role) {
            const teamMembers = await Project.find({}, { "members.email": 1 });
            const emailsInTeams = new Set();
            teamMembers.forEach(p => {
                p.members.forEach(m => {
                    if (m && m.email) emailsInTeams.add(m.email);
                });
            });

            users = users.map(u => ({
                ...u,
                hasTeam: (u.role === 'Student' && u.email) ? emailsInTeams.has(u.email) : false
            }));
        }

        if (availableMentors === 'true' && role === 'Mentor') {
            const settings = await GlobalSettings.findOne() || { mentorTeamLimit: 5 };
            const mentorCounts = await Project.aggregate([
                { $group: { _id: "$mentor.id", count: { $sum: 1 } } }
            ]);

            users = users.filter(u => {
                const count = mentorCounts.find(m => m._id?.toString() === u._id.toString())?.count || 0;
                return count < settings.mentorTeamLimit;
            });
        }

        res.json(users);
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        const saved = await newUser.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Update failed' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ status: 'success', message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Delete failed' });
    }
});

router.post('/seed', async (req, res) => {
    try {
        await User.deleteMany({});
        const initial = [
            {
                name: 'System Admin',
                email: 'admin@edutrack.com',
                password: 'admin',
                role: 'Admin',
                sid: 'ADM001',
                dept: 'IT',
                contact: '9876543210'
            },
            {
                name: 'Arjun Kumar',
                email: 'arjun@college.edu',
                password: 'password',
                role: 'Student',
                sid: '21CS045',
                dept: 'CSE',
                team: 'Team Alpha'
            },
            {
                name: 'Dr. Ramesh V',
                email: 'ramesh@college.edu',
                password: 'password',
                role: 'Mentor',
                sid: 'EMP772',
                dept: 'CSE'
            }
        ];
        await User.insertMany(initial);
        res.json({ status: 'success', message: 'Users seeded' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Bulk Upload Users
router.post('/bulk', async (req, res) => {
    try {
        const { users } = req.body;
        const saved = await User.insertMany(users, { ordered: false });
        res.status(201).json({ status: 'success', count: saved.length });
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
            count: err.insertedDocs?.length || 0
        });
    }
});

module.exports = router;
