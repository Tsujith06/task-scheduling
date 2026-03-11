const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const ReviewPhase = require('./models/ReviewPhase');
const Worklog = require('./models/Worklog');
const Task = require('./models/Task');
const LeaveRequest = require('./models/LeaveRequest');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/task-scheduler';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        await User.deleteMany({});
        await Project.deleteMany({});
        await ReviewPhase.deleteMany({});
        await Worklog.deleteMany({});
        await Task.deleteMany({});
        await LeaveRequest.deleteMany({});

        const users = await User.insertMany([
            { name: "System Admin", email: "admin@edutrack.com", password: "admin", role: "Admin", dept: "IT" },
            { name: "Dr. Ramesh V", email: "mentor@edutrack.com", password: "mentor", role: "Mentor", dept: "CSE", sid: "EMP001", contact: "9876543210", status: "Active" },
            { name: "Dr. Priya M", email: "priya@edutrack.com", password: "password", role: "Mentor", dept: "IT", sid: "EMP002", contact: "9876543211", status: "Active" },
            { name: "Arjun Kumar", email: "arjun@college.edu", password: "password", role: "Student", dept: "CSE", sid: "21CS045", team: "Team Alpha", contact: "9000000001", status: "Active" },
            { name: "Sneha Reddy", email: "sneha@college.edu", password: "password", role: "Student", dept: "CSE", sid: "21CS046", team: "Team Alpha", contact: "9000000002", status: "Active" }
        ]);

        await Task.insertMany([
            {
                title: "Initialize Backend Repository",
                desc: "Setup Node.js environment and Express server with MongoDB connection.",
                cat: "Development",
                epic: "Infastructure",
                priority: "Highest",
                assignee: "Sneha Reddy",
                assignedBy: "Arjun Kumar",
                status: "To-Do",
                assignmentStatus: "Pending",
                deadline: new Date(Date.now() + 86400000 * 2) // 2 days from now
            },
            {
                title: "Draft Project Proposal",
                desc: "Complete the initial proposal document for Review 1.",
                cat: "Documentation",
                epic: "Planning",
                priority: "High",
                assignee: "Arjun Kumar",
                assignedBy: "Dr. Ramesh V",
                status: "To-Do",
                assignmentStatus: "Pending",
                deadline: new Date(Date.now() + 86400000 * 5)
            }
        ]);

        await Project.insertMany([
            {
                id: "ALPHA-001",
                name: "Intelligent Task Scheduling System",
                teamName: "Team Alpha",
                description: "AI-driven project management and monitoring system for university student teams.",
                objectives: [
                    "Dynamic task reassignment based on member availability",
                    "Automated notification and acceptance system",
                    "Real-time progress monitoring and mentor oversight"
                ],
                milestones: [
                    { label: "Requirements Gathering", pct: 100, color: "#10B981", status: "Done" },
                    { label: "Database Design", pct: 100, color: "#10B981", status: "Done" },
                    { label: "UI Development", pct: 65, color: "#6015C1", status: "Active" },
                    { label: "Backend Integration", pct: 40, color: "#6015C1", status: "Active" },
                    { label: "Testing & QA", pct: 0, color: "#F43F5E", status: "Pending" }
                ],
                mentor: { name: "Dr. Ramesh V", dept: "CSE" },
                members: [
                    { name: "Arjun Kumar", sid: "21CS045", role: "Team Lead", status: "Present" },
                    { name: "Sneha Reddy", sid: "21CS046", role: "Backend Dev", status: "Present" }
                ]
            }
        ]);

        await ReviewPhase.insertMany([
            { title: "Review 1", startDate: new Date(2024, 2, 20), endDate: new Date(2024, 2, 21), maxMarks: 50, status: "Completed" },
            { title: "Review 2", startDate: new Date(2024, 3, 10), endDate: new Date(2024, 3, 11), maxMarks: 50, status: "Ongoing" },
            { title: "Final Viva", startDate: new Date(2024, 4, 15), endDate: new Date(2024, 4, 16), maxMarks: 100, status: "Upcoming" }
        ]);

        console.log('Seed completed: 2 Students, 2 Mentors, 1 Admin, 2 Tasks, 1 Project, 3 Phases.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
