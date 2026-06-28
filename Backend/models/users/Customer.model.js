const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: [true, "Shop is required"],
        index: true,
    },
    name: {
        type: String,
        required: [true, ' name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, ' phone number is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        type: String,
        trim: true
    },
    note: {
        type: String,
        trim: true
    }
}, { 
    timestamps: true 
});

customerSchema.index({ shopId: 1, phone: 1 }, { unique: true })

const CustomerModel = mongoose.model('Customer', customerSchema);

module.exports = CustomerModel;
