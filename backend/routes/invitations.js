const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const User = require('../models/User');

// Create Invitation
router.post('/', async (req, res) => {
    try {
        const { teamId, invitedUserId, inviterId, message } = req.body;

        // Check if user already in team
        const project = await Project.findOne({ $or: [{ _id: mongoose.Types.ObjectId.isValid(teamId) ? teamId : null }, { id: teamId }] });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const invitedUser = await User.findById(invitedUserId);
        if (!invitedUser) return res.status(404).json({ message: 'User not found' });

        // Check if user already in team members list
        const isMember = project.members.some(m => m.email === invitedUser.email);
        if (isMember) return res.status(400).json({ message: 'User is already a member of this team' });

        // Check for existing pending invitation
        const existing = await Invitation.findOne({
            teamId,
            invitedUserId,
            status: 'Pending'
        });
        if (existing) return res.status(400).json({ message: 'Invitation already pending' });

        const inviter = await User.findById(inviterId);

        const invitation = new Invitation({
            teamId,
            teamName: project.teamName || project.name,
            inviterId,
            inviterName: inviter ? inviter.name : 'Unknown',
            invitedUserId,
            // Include details for the roster view
            invitedUserName: invitedUser.name,
            invitedUserEmail: invitedUser.email,
            invitedUserSid: invitedUser.sid,
            invitedUserDept: invitedUser.dept,
            message
        });

        await invitation.save();
        res.status(201).json(invitation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Team's Sent Invitations
router.get('/team/:teamId', async (req, res) => {
    try {
        const invitations = await Invitation.find({ teamId: req.params.teamId });
        // We might want to populate invited user details if not in model
        const results = await Promise.all(invitations.map(async inv => {
            const user = await User.findById(inv.invitedUserId);
            return {
                ...inv.toObject(),
                invitedUserName: user ? user.name : 'Unknown',
                invitedUserEmail: user ? user.email : 'Unknown',
                invitedUserSid: user ? user.sid : 'Unknown',
                invitedUserDept: user ? user.dept : 'Unknown'
            };
        }));
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get My Invitations
router.get('/me/:userId', async (req, res) => {
    try {
        const invitations = await Invitation.find({
            invitedUserId: req.params.userId,
            status: 'Pending'
        });
        res.json(invitations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Respond to Invitation
router.put('/:id/respond', async (req, res) => {
    try {
        const { status } = req.body; // 'Accepted' or 'Rejected'
        const invitation = await Invitation.findById(req.params.id);

        if (!invitation) return res.status(404).json({ message: 'Invitation not found' });
        if (invitation.status !== 'Pending') return res.status(400).json({ message: 'Invitation already processed' });

        invitation.status = status;
        await invitation.save();

        if (status === 'Accepted') {
            const project = await Project.findOne({ $or: [{ _id: mongoose.Types.ObjectId.isValid(invitation.teamId) ? invitation.teamId : null }, { id: invitation.teamId }] });
            const user = await User.findById(invitation.invitedUserId);

            if (project && user) {
                // Add to project members if not already there
                const isMember = project.members.some(m => m.email === user.email);
                if (!isMember) {
                    project.members.push({
                        name: user.name,
                        email: user.email,
                        sid: user.sid,
                        dept: user.dept,
                        role: 'Member',
                        status: 'Present'
                    });
                    await project.save();
                }

                // Update user team
                user.team = project.teamName || project.name;
                await user.save();
            }
        }

        res.json(invitation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
