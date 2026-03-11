const mongoose = require('mongoose');
const User = require('./models/User');

async function check() {
    await mongoose.connect('mongodb://127.0.0.1:27017/task-scheduler');
    const students = await User.countDocuments({ role: 'Student' });
    const mentors = await User.countDocuments({ role: 'Mentor' });
    console.log(`Students: ${students}, Mentors: ${mentors}`);
    process.exit();
}
check();
