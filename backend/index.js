const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serverless MongoDB Connection
let isConnected = false;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;

    if (process.env.NODE_ENV === 'production') {
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI environment variable is missing.');
            throw new Error('MONGO_URI is missing');
        }
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connected to MongoDB Atlas (Production)');
        return;
    }

    // Local Development Fallbacks
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/task-scheduler';
    try {
        if (!process.env.MONGO_URI) {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            await mongoose.connect(mongoServer.getUri());
            console.log('✨ In-memory MongoDB started');
        } else {
            await mongoose.connect(MONGO_URI);
            console.log('✅ Connected to MongoDB (Local)');
        }
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            await mongoose.connect(mongoServer.getUri());
            console.log('✨ Fallback: In-memory MongoDB started');
        } catch (e) {
            console.error('❌ Critical: Could not start any database');
        }
    }
};

// Ensure DB connection before processing requests (crucial for Serverless Vercel)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Import Routes
const taskRoutes = require('./routes/tasks');
const worklogRoutes = require('./routes/worklogs');
const reviewRoutes = require('./routes/reviews');
const projectRoutes = require('./routes/projects');
const userRoutes = require('./routes/users');
const phaseRoutes = require('./routes/phases');
const leaveRoutes = require('./routes/leaves');
const authRoutes = require('./routes/auth');
const invitationRoutes = require('./routes/invitations');
const projectPoolRoutes = require('./routes/projectPool');
const settingsRoutes = require('./routes/settings');

// Routes Registry
app.use('/api/tasks', taskRoutes);
app.use('/api/worklogs', worklogRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/phases', phaseRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/project-pool', projectPoolRoutes);
app.use('/api/settings', settingsRoutes);

// Global Seed Route
app.get('/api/seed', async (req, res) => {
    try {
        const User = require('./models/User');
        const Project = require('./models/Project');
        const ReviewPhase = require('./models/ReviewPhase');
        const Worklog = require('./models/Worklog');
        const Task = require('./models/Task');
        const LeaveRequest = require('./models/LeaveRequest');
        const Invitation = require('./models/Invitation');

        // Clear existing
        await Promise.all([
            User.deleteMany({}),
            Project.deleteMany({}),
            ReviewPhase.deleteMany({}),
            Worklog.deleteMany({}),
            Task.deleteMany({}),
            LeaveRequest.deleteMany({}),
            Invitation.deleteMany({})
        ]);

        // 1. Seed Users
        const users = await User.insertMany([
            { name: "System Admin", email: "admin@edutrack.com", password: "admin", role: "Admin", dept: "IT" },
            { name: "Dr. Ramesh V", email: "mentor@edutrack.com", password: "mentor", role: "Mentor", dept: "CSE", sid: "EMP001", contact: "9876543210", status: "Active" },
            { name: "Arjun Kumar", email: "arjun@college.edu", password: "password", role: "Student", dept: "CSE", sid: "21CS045", team: "Team Alpha", contact: "9000000001", status: "Active" },
            { name: "Akash Mishra", email: "akash@college.edu", password: "password", role: "Student", dept: "CSE", sid: "21CS999", contact: "9000000999", status: "Active" }
        ]);

        const admin = users[0];
        const mentorRamesh = users[1];
        const studentArjun = users[2];
        const studentAkash = users[3];

        // 2. Seed Projects
        await Project.insertMany([
            {
                id: 'ALPHA-001', name: "Cloud Task Scheduler", teamName: "Team Alpha",
                description: "A comprehensive project management system.",
                objectives: ["Real-time Kanban", "Worklog management"],
                milestones: [
                    { label: "Requirements", pct: 100, color: "#10B981", status: "Done" },
                    { label: "Design", pct: 75, color: "#6015C1", status: "Active" }
                ],
                mentor: { name: mentorRamesh.name, dept: mentorRamesh.dept },
                members: [
                    { name: studentArjun.name, role: "Lead", sid: studentArjun.sid, status: "Present" }
                ]
            }
        ]);

        // 3. Seed Phases
        await ReviewPhase.insertMany([
            { 
                title: "Semester VI Governance", 
                reviews: [
                    { title: "Review 1: Concept", startDate: new Date("2025-01-10"), endDate: new Date("2025-01-15"), maxMarks: 50 },
                    { title: "Review 2: Alpha", startDate: new Date("2025-03-25"), endDate: new Date("2025-03-30"), maxMarks: 100 }
                ]
            }
        ]);

        // 4. Seed Worklogs
        await Worklog.insertMany([
            { userId: studentArjun._id, userName: studentArjun.name, week: "Week 12", date: "2025-03-10", task: "Auth UI", description: "Design login layout.", pct: 100 }
        ]);

        // 5. Seed Tasks
        await Task.insertMany([
            { title: "Dashboard Hero", desc: "Design section", cat: "Frontend", status: "Completed", priority: "High", assignee: studentArjun.name },
            { title: "API Connect", desc: "Set up axios", cat: "Integration", status: "In Progress", priority: "Medium", assignee: studentArjun.name }
        ]);

        // 6. Seed Leaves
        await LeaveRequest.insertMany([
            { mentorId: mentorRamesh._id, mentorName: mentorRamesh.name, reviewDate: new Date("2025-03-27"), reason: "Academic Conference", status: "Pending" }
        ]);

        res.json({ status: 'success', message: 'Platform seeded with minimal data: 1 Admin, 1 Mentor, 2 Students' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/', (req, res) => res.json({ status: 'EduTrack Backend is running', timestamp: new Date() }));

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;
