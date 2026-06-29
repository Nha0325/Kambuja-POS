require('dotenv').config();
const mongoose = require('mongoose');

// Import all related models
const Sale = require('./models/sales/Sale.model');
const DailyClose = require('./models/sales/DailyClose.model');
const Receipt = require('./models/sales/Receipt.model');
const Payment = require('./models/payment/Payment.model');
const StockMovement = require('./models/misc/StockMovement.model');

async function wipeSales() {
    try {
        console.log("Connecting to MongoDB...");
        // Make sure to use the correct URI (Production vs Local)
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected successfully to:", process.env.MONGODB_URI.split('@').pop());

        console.log("\nStarting data wipe...");

        const salesCount = await Sale.deleteMany({});
        console.log(`✅ Deleted ${salesCount.deletedCount} Sales`);

        const dailyCloseCount = await DailyClose.deleteMany({});
        console.log(`✅ Deleted ${dailyCloseCount.deletedCount} Shift Closes (DailyClose)`);

        const receiptCount = await Receipt.deleteMany({});
        console.log(`✅ Deleted ${receiptCount.deletedCount} Receipts`);

        const paymentCount = await Payment.deleteMany({});
        console.log(`✅ Deleted ${paymentCount.deletedCount} Payments`);

        // Optional: Delete stock movements that were related to sales
        const movementCount = await StockMovement.deleteMany({ type: "SALE" });
        console.log(`✅ Deleted ${movementCount.deletedCount} Sale Stock Movements`);

        console.log("\n🎉 ALL SALES DATA CLEARED SUCCESSFULLY!");

    } catch (error) {
        console.error("❌ Error wiping data:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
        process.exit(0);
    }
}

wipeSales();
