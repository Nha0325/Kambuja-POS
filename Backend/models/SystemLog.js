const mongoose = require("mongoose");

const systemLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: { type: String },
  userEmail: { type: String },
  role: { type: String, enum: ["ADMIN_MANAGER", "ADMIN", "CASHIER"] },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  shopName: { type: String },
  action: { 
    type: String, 
    enum: ["LOGIN", "LOGIN_FAILED", "LOGOUT", "CREATE", "UPDATE", "DELETE", "STOCK_IN", "STOCK_OUT", "SALE_CREATE", "PURCHASE_CREATE", "RESTORE"] 
  },
  entity: { type: String },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  message: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

systemLogSchema.index({ createdAt: -1 });
systemLogSchema.index({ action: 1 });
systemLogSchema.index({ role: 1 });
systemLogSchema.index({ userEmail: 1 });
systemLogSchema.index({ shopId: 1 });

module.exports = mongoose.model("SystemLog", systemLogSchema);
