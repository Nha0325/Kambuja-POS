const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: [true, "Shop is required"],
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    note:{
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    }
}, { timestamps: true });

categorySchema.index({ shopId: 1, name: 1 }, { unique: true })

const CategoryModel = mongoose.model('Category', categorySchema);

module.exports = CategoryModel;
