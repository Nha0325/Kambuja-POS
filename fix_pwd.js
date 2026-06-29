require('dotenv').config({ path: 'Backend/.env' });
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = mongoose.connection.db.collection('users');
        const hashed = await bcryptjs.hash('pkay12345678', 10);
        await users.updateOne({ email: 'pkay@gmail.com' }, { $set: { password: hashed } });
        console.log("Password reset successfully for pkay@gmail.com");
        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}
fix();
