require("../config/env")

const mongoose = require("mongoose")
const { connectToDatabase } = require("./db")
const Shop = require("../models/system/Shop.model")
const User = require("../models/users/User.model")
const Category = require("../models/inventory/Category.model")
const Product = require("../models/inventory/Product.model")
const Supplier = require("../models/purchase/Supplier.model")
const Purchase = require("../models/purchase/Purchase.model")
const Sale = require("../models/sales/Sale.model")
const ProductCode = require("../models/inventory/ProductCode.model")
const Inventory = require("../models/inventory/Inventory.model")
const StockMovement = require("../models/misc/StockMovement.model")
const Payment = require("../models/payment/Payment.model")
const Receipt = require("../models/sales/Receipt.model")
const AuditLog = require("../models/misc/AuditLog.model")
const NotificationChannel = require("../models/engagement/NotificationChannel.model")
const NotificationLog = require("../models/engagement/NotificationLog.model")
const { ROLES } = require("../constants/roles")

const ensureDefaultShop = async (ownerAdminId) => {
    const existing = await Shop.findOne({ code: "MAIN" })
    if (existing) return existing

    return Shop.create({
        name: "Main Shop",
        code: "MAIN",
        ownerAdminId,
        province: "Default",
        city: "Default",
        status: "ACTIVE",
    })
}

const dropLegacyUniqueIndex = async (model, indexName) => {
    const indexes = await model.collection.indexes()
    if (indexes.some((index) => index.name === indexName)) {
        await model.collection.dropIndex(indexName)
    }
}

const run = async () => {
    await connectToDatabase()
    const scopedModels = [Category, Product, Supplier, Purchase, Sale]
    const legacyBusinessUsers = await User.collection.countDocuments({
        $or: [
            { role: { $in: ["admin", "cashier"] } },
            {
                role: { $in: [ROLES.ADMIN, ROLES.CASHIER] },
                $or: [{ shopId: null }, { shopId: { $exists: false } }],
            },
        ],
    })
    const unscopedDocumentCounts = await Promise.all(
        scopedModels.map((model) => model.collection.countDocuments({
            $or: [{ shopId: null }, { shopId: { $exists: false } }],
        }))
    )
    const needsDefaultShop = legacyBusinessUsers > 0
        || unscopedDocumentCounts.some((count) => count > 0)
    let ownerAdminForDefaultShop = null
    if (needsDefaultShop) {
        ownerAdminForDefaultShop = await User.collection.findOne({
            role: { $in: [ROLES.ADMIN, "admin"] },
        })
        if (!ownerAdminForDefaultShop) {
            throw new Error("Cannot create default shop: no ADMIN user is available as ownerAdminId")
        }
    }
    const defaultShop = needsDefaultShop ? await ensureDefaultShop(ownerAdminForDefaultShop._id) : null

    const roleMigrations = [
        User.collection.updateMany({ role: { $in: ["super", "admin_manager", "manager"] } }, {
            $set: { role: ROLES.ADMIN_MANAGER, shopId: null, status: "ACTIVE" },
        }),
    ]

    if (defaultShop) {
        roleMigrations.push(
            User.collection.updateMany({ role: "admin" }, {
                $set: { role: ROLES.ADMIN, shopId: defaultShop._id, status: "ACTIVE" },
            }),
            User.collection.updateMany({ role: "cashier" }, {
                $set: { role: ROLES.CASHIER, shopId: defaultShop._id, status: "ACTIVE" },
            }),
            User.updateMany({
                role: { $in: [ROLES.ADMIN, ROLES.CASHIER] },
                shopId: null,
            }, {
                $set: { shopId: defaultShop._id, status: "ACTIVE" },
            })
        )
    }

    const roleResults = await Promise.all(roleMigrations)
    const scopeResults = []
    if (defaultShop) {
        for (const model of scopedModels) {
            scopeResults.push(await model.updateMany(
                { $or: [{ shopId: null }, { shopId: { $exists: false } }] },
                { $set: { shopId: defaultShop._id } }
            ))
        }
    }

    const products = await Product.find({}, { _id: 1, shopId: 1, code: 1, currentStock: 1 })
    if (products.length > 0) {
        await Inventory.bulkWrite(products.map((product) => ({
            updateOne: {
                filter: { shopId: product.shopId, product: product._id },
                update: {
                    $setOnInsert: {
                        shopId: product.shopId,
                        product: product._id,
                        quantity: Number(product.currentStock || 0),
                        reorderLevel: 5,
                    },
                },
                upsert: true,
            },
        })))

        await ProductCode.bulkWrite(products.filter((product) => product.code).map((product) => ({
            updateOne: {
                filter: { shopId: product.shopId, code: product.code },
                update: {
                    $setOnInsert: {
                        shopId: product.shopId,
                        product: product._id,
                        code: product.code,
                        type: "SKU",
                    },
                },
                upsert: true,
            },
        })))
    }

    await dropLegacyUniqueIndex(Category, "name_1")
    await dropLegacyUniqueIndex(Supplier, "phone_1")

    await Promise.all([
        User.syncIndexes(),
        Shop.syncIndexes(),
        Category.syncIndexes(),
        Product.syncIndexes(),
        Supplier.syncIndexes(),
        Purchase.syncIndexes(),
        Sale.syncIndexes(),
        ProductCode.syncIndexes(),
        Inventory.syncIndexes(),
        StockMovement.syncIndexes(),
        Payment.syncIndexes(),
        Receipt.syncIndexes(),
        AuditLog.syncIndexes(),
        NotificationChannel.syncIndexes(),
        NotificationLog.syncIndexes(),
    ])

    const modifiedRoles = roleResults.reduce((sum, result) => sum + result.modifiedCount, 0)
    const scopedDocuments = scopeResults.reduce((sum, result) => sum + result.modifiedCount, 0)

    console.log(`default_shop=${defaultShop?._id || "not-required"}`)
    console.log(`roles_migrated=${modifiedRoles}`)
    console.log(`documents_scoped=${scopedDocuments}`)
}

run()
    .then(() => mongoose.disconnect())
    .catch(async (error) => {
        console.error(error.message)
        await mongoose.disconnect().catch(() => {})
        process.exitCode = 1
    })
