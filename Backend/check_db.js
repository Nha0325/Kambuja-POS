require('dotenv').config();
const mongoose = require('mongoose');
const DailyClose = require('./models/sales/DailyClose.model');
const Sale = require('./models/sales/Sale.model');

async function debugDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        
        console.log("Start:", start.toISOString());
        console.log("End:", end.toISOString());

        const latestClose = await DailyClose.findOne({}).sort({ createdAt: -1 });
        console.log("\n--- LATEST DAILY CLOSE ---");
        console.log(latestClose ? latestClose.toObject() : "No DailyClose found!");

        const latestSales = await Sale.find({}).sort({ createdAt: -1 }).limit(3);
        console.log("\n--- LATEST SALES ---");
        latestSales.forEach(s => console.log(`Sale ID: ${s._id}, CreatedAt: ${s.createdAt}`));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

debugDatabase();
