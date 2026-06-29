require('./config/env');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Product = require('./models/inventory/Product.model');
    const shopId = new mongoose.Types.ObjectId();
    const payload1 = {
        name: "Test Product 1", category: new mongoose.Types.ObjectId(),
        code: "TEST1234", imageUrl: "test.jpg", costPrice: 1, salePrice: 2,
        shopId: shopId, sku: "", barcode: ""
    };
    const payload2 = {
        name: "Test Product 2", category: new mongoose.Types.ObjectId(),
        code: "TEST5678", imageUrl: "test2.jpg", costPrice: 1, salePrice: 2,
        shopId: shopId, sku: "", barcode: ""
    };
    try {
        const normalizeProductPayload = (body) => {
            const payload = { ...(body || {}) }
            if (payload.barcode === "") delete payload.barcode
            if (payload.sku === "") delete payload.sku
            return payload
        }
        
        await Product.create(normalizeProductPayload(payload1));
        console.log("Created product 1");
        await Product.create(normalizeProductPayload(payload2));
        console.log("Created product 2");
        process.exit(0);
    } catch(e) {
        console.error("ERROR:");
        console.error(e.message);
        process.exit(1);
    }
});
