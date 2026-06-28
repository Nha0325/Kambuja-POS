const mongoose = require('mongoose');
const Sale = require('../../models/sales/Sale.model');
const Product = require('../../models/inventory/Product.model');
const Counter = require('../../models/system/Counter.model');
require('../../config/env');

async function syncCounters() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

       
        const lastSale = await Sale.findOne().sort({ invoiceNumber: -1 });
        if (lastSale) {
            const lastVal = parseInt(lastSale.invoiceNumber, 10);
            await Counter.findOneAndUpdate(
                { _id: "invoice_number" },
                { sequence_value: lastVal },
                { upsert: true }
            );
            console.log(`Invoice counter synced to: ${lastVal}`);
        }

        // 2. Sync Product Code
        const lastProduct = await Product.findOne().sort({ code: -1 });
        if (lastProduct) {
            const lastCodeVal = parseInt(lastProduct.code, 10);
            await Counter.findOneAndUpdate(
                { _id: "product_code" },
                { sequence_value: lastCodeVal },
                { upsert: true }
            );
            console.log(`Product code counter synced to: ${lastCodeVal}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Sync failed:", error);
        process.exit(1);
    }
}

syncCounters();
