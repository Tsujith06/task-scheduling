const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Project = require('../models/Project');

const User = require('../models/User');
const GlobalSettings = require('../models/GlobalSettings');

// Get all projects
router.get('/', async (req, res) => {
    try {
        const { mentorId } = req.query;
        let query = {};
        if (mentorId) query['mentor.id'] = mentorId;
        const projects = await Project.find(query);
        res.json(projects);
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Failed to fetch projects' });
    }
});

// Create a new team (Formation Phase)
router.post('/formation', async (req, res) => {
    try {
        const { teamName, teamLeadId, leadName, leadSid } = req.body;

        // Check if lead already in a team
        const existing = await Project.findOne({ "members.sid": leadSid });
        if (existing) return res.status(400).json({ message: 'User already belongs to a team' });



        const lead = await User.findById(teamLeadId);
        if (!lead) return res.status(404).json({ message: 'Lead user not found' });

        const project = new Project({
            id: `TEAM-${Date.now()}`,
            teamName,
            teamLead: teamLeadId,
            status: 'Formation',
            members: [{
                name: lead.name,
                email: lead.email,
                sid: lead.sid,
                dept: lead.dept,
                role: 'Team Lead',
                status: 'Present'
            }]
        });

        await project.save();
        res.status(201).json(project);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Select Mentor
router.put('/:id/select-mentor', async (req, res) => {
    try {
        const { mentorId, mentorName, mentorDept, status } = req.body;
        const project = await Project.findOne({ id: req.params.id });
        if (!project) return res.status(404).json({ message: 'Team not found' });

        if (status) {
            project.status = status;
        }

        if (mentorId) {
            const settings = await GlobalSettings.findOne() || { mentorTeamLimit: 5 };
            const assignedTeams = await Project.countDocuments({ "mentor.id": mentorId });

            if (assignedTeams >= settings.mentorTeamLimit) {
                return res.status(400).json({ message: 'This mentor has reached their team limit' });
            }
            project.mentor = { id: mentorId, name: mentorName, dept: mentorDept };
            project.status = 'ProposalSubmission';
        }

        await project.save();
        res.json(project);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Select Project Title & Submit Proposal
router.put('/:id/submit-proposal', async (req, res) => {
    try {
        const { name, abstract, srsUrl } = req.body;
        const project = await Project.findOne({ id: req.params.id });
        if (!project) return res.status(404).json({ message: 'Team not found' });

        const settings = await GlobalSettings.findOne();
        if (settings?.submissionDeadline && new Date() > new Date(settings.submissionDeadline)) {
            return res.status(400).json({ message: 'Submission deadline has passed' });
        }

        project.name = name;
        project.abstract = abstract;
        project.srsUrl = srsUrl;
        project.status = 'PendingApproval';
        await project.save();
        res.json(project);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Mentor Approval/Rejection
router.put('/:id/review', async (req, res) => {
    try {
        const { status, rejectionReason } = req.body; // 'Approved' or 'Rejected'
        const project = await Project.findOne({ id: req.params.id });
        if (!project) return res.status(404).json({ message: 'Team not found' });

        project.status = status;
        if (status === 'Rejected') {
            project.rejectionReason = rejectionReason;
        } else {
            project.rejectionReason = undefined;
            // Maybe initialize milestones here
        }
        await project.save();
        res.json(project);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Legacy routes preserved or adapted...
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // 1. Try finding by Project's internal business ID (e.g., TEAM-123)
        let project = await Project.findOne({ id: id });

        if (!project) {
            // 2. Check if the ID is a valid MongoDB ObjectId
            const isMongoId = mongoose.Types.ObjectId.isValid(id);

            if (isMongoId) {
                const user = await User.findById(id);
                if (user) {
                    // Try to find project where user is lead or member
                    project = await Project.findOne({
                        $or: [
                            { teamLead: user._id },
                            { "members.sid": user.sid }
                        ]
                    });

                    // IF we are specifically checking for a USER'S team,
                    // and they DON'T have one, return 200 with null.
                    // This is better for the frontend "User has team?" check.
                    if (!project) return res.json(null);
                }
            }
        }

        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        console.error("Fetch project error:", err);
        res.status(500).json({ status: 'error', message: 'Failed to fetch project' });
    }
});


module.exports = router;
