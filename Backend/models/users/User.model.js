const { default: mongoose } = require("mongoose");
const { ROLES, normalizeRole } = require('../../constants/roles')

const schema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "username is required"]     
    },
    
    fullName: {
        type: String,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: [true, "email is required"]
    },
    phone: {
        type: String,
    },
    lastLogin: {
        type: Date,
    },
    sessionToken: {
        type: String,
        select: false
    },
    password: {
        type: String,
        minLength: 6,
        select: false,
        required: [true, "passwoed is required"]
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        set: normalizeRole,
        required: [true, "role is required"]
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        default: null,
        required: function requireShopForBusinessRole() {
            return this.role === ROLES.CASHIER
        },
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE",
    }

},{timestamps: true})

schema.pre("validate", function enforceManagerScope() {
    if (this.role === ROLES.ADMIN_MANAGER) {
        this.shopId = null
    }
})

const User = mongoose.model("User", schema)

module.exports = User
