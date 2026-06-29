require('dotenv').config({ path: 'Backend/.env' });
const mongoose = require('mongoose');

async function wipe() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB. Wiping sales and daily closes...");
        const db = mongoose.connection.db;
        await db.collection('sales').deleteMany({});
        await db.collection('dailycloses').deleteMany({});
        await db.collection('carts').deleteMany({});
        console.log("✅ All sales, daily closes, and carts have been deleted.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
wipe();
