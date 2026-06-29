require('./Backend/config/env');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Product = require('./Backend/models/inventory/Product.model');
    const payload = {
        name: "Test Product", category: new mongoose.Types.ObjectId(),
        code: "TEST1234", imageUrl: "test.jpg", costPrice: 1, salePrice: 2,
        shopId: new mongoose.Types.ObjectId(), sku: null, barcode: null
    };
    try {
        const doc = new Product(payload);
        await doc.validate();
        console.log("Validated doc:", doc.toObject());
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
});
