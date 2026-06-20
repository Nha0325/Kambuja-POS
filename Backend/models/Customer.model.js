const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true
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

const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
module.exports = CustomerModel;