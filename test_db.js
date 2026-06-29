require('dotenv').config({ path: 'Backend/.env' });
const mongoose = require('mongoose');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log("Users in DB:");
        users.forEach(u => console.log(`- Email: ${u.email} | Role: ${u.role} | Status: ${u.status}`));
        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}
test();
