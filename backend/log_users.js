const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/task-scheduler';

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await User.find({});
        console.log(`Total users in DB: ${users.length}`);
        console.log(JSON.stringify(users.map(u => ({ name: u.name, role: u.role })), null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
