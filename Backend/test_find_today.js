require('dotenv').config();
const mongoose = require('mongoose');
const DailyClose = require('./models/sales/DailyClose.model');
const Sale = require('./models/sales/Sale.model');

async function testFindToday() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        
        console.log("Start:", start.toISOString());
        console.log("End:", end.toISOString());

        const shopId = new mongoose.Types.ObjectId('6a40f8450f0cdae3e61aa7c2');
        const cashier = new mongoose.Types.ObjectId('6a40f8e1538959ed557cd5ac');

        const lastClose = await DailyClose.findOne({
            shopId: shopId,
            cashier: cashier,
            status: 'CLOSED',
            createdAt: { $gte: start, $lte: end }
        }).sort({ closedAt: -1 });

        console.log("\n--- FOUND LAST CLOSE ---");
        console.log(lastClose ? lastClose.toObject() : "NULL");

        let salesStart = start;
        if (lastClose && lastClose.closedAt) {
            salesStart = new Date(lastClose.closedAt);
            console.log("\nUsing salesStart:", salesStart.toISOString());
        }

        const sales = await Sale.find({
            shopId: shopId,
            user: cashier,
            createdAt: { $gt: salesStart, $lte: end }
        });

        console.log("\n--- FOUND SALES ---");
        console.log(`Count: ${sales.length}`);
        sales.forEach(s => console.log(`Sale ID: ${s._id}, CreatedAt: ${s.createdAt}`));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

testFindToday();
