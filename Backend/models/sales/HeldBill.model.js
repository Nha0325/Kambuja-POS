const mongoose = require("mongoose");

const HeldBillSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    holdNumber: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
    },
    note: {
      type: String,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    totalCost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["HELD", "COMPLETED", "CANCELLED"],
      default: "HELD",
    },
    completedSale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
    },
  },
  { timestamps: true }
);

// We should probably ensure holdNumber is unique per shop
HeldBillSchema.index({ shopId: 1, holdNumber: 1 }, { unique: true });

module.exports = mongoose.model("HeldBill", HeldBillSchema);
