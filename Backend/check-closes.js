require('dotenv').config();
const mongoose = require('mongoose');
const DailyClose = require('./models/sales/DailyClose.model');
const Sale = require('./models/sales/Sale.model');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const closes = await DailyClose.find({}).sort({createdAt: -1}).limit(5);
    console.log("LAST CLOSES:", closes);
    const sales = await Sale.find({}).sort({createdAt: -1}).limit(5);
    console.log("LAST SALES:", sales.map(s => ({_id: s._id, createdAt: s.createdAt})));
    process.exit(0);
}
check();
