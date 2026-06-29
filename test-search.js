require('dotenv').config({ path: 'Backend/.env' });
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Product = require('./Backend/models/inventory/Product.model');
    const Sale = require('./Backend/models/sales/Sale.model');
    const p = await Product.find({ $text: { $search: 'a' } }).limit(2);
    console.log('Products:', p.length);
    mongoose.connection.close();
});
