const { default: mongoose } = require("mongoose");


const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Category is required"],
        ref: "Category"
    },
    code: {
        type: String,
        unique: true,
        required: [true, "Code product is required"]
    },
    imageUrl: {
        type: String,
        required: [true, "Image is required"]
    },
    costPrice: {
        type: Number,
        required: [true,"Cost price is required"]
    },
    salePrice: {
        type: Number,
        required: [true,"Sale price is required"]

    },
    currentStock: {
        type: Number,
        min: [0, "Current stock must be greater than or equal zero"],
        default: 0
    },
    note:{
        type: String
    }

}, {timestamps: true})

const Product = mongoose.model("Product", schema)

module.exports = Product