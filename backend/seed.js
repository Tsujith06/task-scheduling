const mongoose = require('mongoose');
const Project = require('./models/Project');
const ReviewPhase = require('./models/ReviewPhase');
const Worklog = require('./models/Worklog');
const Task = require('./models/Task');
const LeaveRequest = require('./models/LeaveRequest');

const MONGO_URI = 'mongodb://127.0.0.1:27017/task-scheduler'; // Adjust if using memory server differently

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing
        await Promise.all([
            Project.deleteMany({}),
            ReviewPhase.deleteMany({}),
            Worklog.deleteMany({}),
            Task.deleteMany({}),
            LeaveRequest.deleteMany({})
        ]);

        // 1. Projects
        const projects = [
            {
                id: 'ALPHA-001',
                name: "Cloud-Based Task Scheduler",
                teamName: "Team Alpha",
                description: "A comprehensive project management system for academic teams.",
                objectives: ["Real-time Kanban", "Worklog management", "Mentor analytics"],
                milestones: [
                    { label: "Requirements", pct: 100, color: "#10B981", status: "Done" },
                    { label: "System Design", pct: 75, color: "#6015C1", status: "Active" },
                    { label: "Development", pct: 40, color: "#3B82F6", status: "Active" }
                ],
                mentor: { name: "Dr. Ramesh V", dept: "Computer Science" },
                members: [
                    { name: "Arjun Kumar", role: "Team Lead", sid: "21CS045", email: "arjun@college.edu" },
                    { name: "Priya Singh", role: "Developer", sid: "21CS046", email: "priya@college.edu" }
                ]
            },
            {
                id: 'OMEGA-002',
                name: "AI-Powered Plagiarism Detector",
                teamName: "Team Omega",
                description: "Leveraging NLP to detect semantic plagiarism in academic submissions.",
                objectives: ["NLP Analysis", "PDF Parsing", "Report Generation"],
                milestones: [
                    { label: "Research", pct: 100, color: "#10B981", status: "Done" },
                    { label: "Model Training", pct: 20, color: "#6015C1", status: "Active" }
                ],
                mentor: { name: "Dr. Ramesh V", dept: "Computer Science" },
                members: [
                    { name: "Vikram Malhotra", role: "Team Lead", sid: "21CS088", email: "vikram@college.edu" },
                    { name: "Ananya Iyer", role: "ML Engineer", sid: "21CS089", email: "ananya@college.edu" }
                ]
            }
        ];
        await Project.insertMany(projects);

        // 2. Phases
        const phases = [
            { 
                title: "Semester VI Project Phases", 
                status: "Ongoing",
                reviews: [
                    { 
                        title: "Review 1: Conceptual Design", 
                        startDate: new Date("2024-12-01"), 
                        endDate: new Date("2024-12-05"), 
                        maxMarks: 50,
                        rubrics: [
                            { title: "Literature Survey", description: "Relevance of sources", maxMarks: 25 },
                            { title: "Forming Objectives", description: "Clarity of goals", maxMarks: 25 }
                        ]
                    },
                    { 
                        title: "Review 2: Prototype Architecture", 
                        startDate: new Date("2025-03-25"), 
                        endDate: new Date("2025-03-30"), 
                        maxMarks: 100,
                        rubrics: [
                            { title: "Technical Architecture", description: "System design clarity", maxMarks: 50 },
                            { title: "Tool Selection", description: "Modern tool usage", maxMarks: 50 }
                        ]
                    }
                ]
            }
        ];
        await ReviewPhase.insertMany(phases);

        // 3. Worklogs
        const worklogs = [
            { studentName: "Arjun Kumar", taskName: "Auth Logic", hours: 4, description: "Implemented JWT strategy.", date: new Date(), evidence: "auth_v1.zip" },
            { studentName: "Priya Singh", taskName: "DB Schema", hours: 6, description: "Optimized queries.", date: new Date(), evidence: "schema.sql" },
            { studentName: "Vikram Malhotra", taskName: "NLP Model", hours: 8, description: "Trained initial BERT model.", date: new Date() }
        ];
        await Worklog.insertMany(worklogs);

        // 4. Tasks
        const tasks = [
            { title: "Dashboard UI", description: "Design hero section", status: "Completed", priority: "High", assignee: "Arjun Kumar", deadline: new Date() },
            { title: "API Integration", description: "Connect frontend to backend", status: "In Progress", priority: "Medium", assignee: "Priya Singh", deadline: new Date() },
            { title: "Model Research", description: "Read papers on transformers", status: "To-Do", priority: "Low", assignee: "Vikram Malhotra", deadline: new Date() }
        ];
        await Task.insertMany(tasks);

        // 5. Leave Requests
        const leaves = [
            { mentorName: "Dr. Ramesh V", mentorId: "65e7a9b0", reviewDate: new Date("2025-03-27"), reason: "Family Event", status: "Pending" }
        ];
        await LeaveRequest.insertMany(leaves);

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seed();
