const bcryptjs = require("bcryptjs")
const Shop = require("../models/Shop.model")
const User = require("../models/User.model")
const Sale = require("../models/Sale.model")
const AuditLog = require("../models/AuditLog.model")
const Location = require("../models/Location.model")
const Product = require("../models/Product.model")
const Category = require("../models/Category.model")
const Purchase = require("../models/Purchase.model")
const StockMovement = require("../models/StockMovement.model")
const Receipt = require("../models/Receipt.model")
const Customer = require("../models/Customer.model")
const Supplier = require("../models/Supplier.model")
const Subscription = require("../models/Subscription.model")
const Inventory = require("../models/Inventory.model")
const { ROLES } = require("../constants/roles")
const { writeAuditLog } = require("../helper/audit")
const { generateShopCode } = require("./counter.controller")
const { createAdminActivityAlert } = require("../helper/alert.helper")

const requiredShopFields = ["name", "ownerAdminId"]

const cleanUserProjection = "username email phone role status shopId createdAt lastLogin"
const shopPopulate = [
    { path: "ownerAdminId", select: cleanUserProjection },
    { path: "createdBy", select: "username email role" },
]

// Address functions removed as Shop now only contains business fields
const normalizeString = (value) => (typeof value === "string" ? value.trim() : "")

const normalizeShopPayload = (body) => {
    return {
        name: normalizeString(body.name),
        code: normalizeString(body.code).toUpperCase() || undefined,
        ownerAdminId: body.ownerAdminId,
        businessType: normalizeString(body.businessType) || undefined,
        billingPhone: normalizeString(body.billingPhone) || undefined,
        billingEmail: normalizeString(body.billingEmail).toLowerCase() || undefined,
        subscriptionPlan: ["Free", "Basic", "Pro"].includes(body.subscriptionPlan) ? body.subscriptionPlan : "Free",
        subscriptionPrice: body.subscriptionPrice !== undefined ? Number(body.subscriptionPrice) : 0,
        subscriptionStartDate: body.subscriptionStartDate || undefined,
        subscriptionExpireDate: body.subscriptionExpireDate || undefined,
        subscriptionPaymentStatus: ["Paid", "Unpaid", "Pending"].includes(body.subscriptionPaymentStatus) ? body.subscriptionPaymentStatus : "Unpaid",
        subscriptionStatus: ["Active", "Expired", "Suspended", "Cancelled"].includes(body.subscriptionStatus) ? body.subscriptionStatus : "Active",
        posAccess: body.posAccess !== undefined ? Boolean(body.posAccess) : true,
        maxLocations: body.maxLocations ? Number(body.maxLocations) : 1,
        maxCashiers: body.maxCashiers ? Number(body.maxCashiers) : 1,
        maxProducts: body.maxProducts ? Number(body.maxProducts) : 100,
        logo: normalizeString(body.logo) || undefined,
        defaultCurrency: ["USD", "KHR"].includes(body.defaultCurrency) ? body.defaultCurrency : "USD",
        defaultTax: body.defaultTax ? Number(body.defaultTax) : 0,
        provinceKh: normalizeString(body.provinceKh) || undefined,
        provinceEn: normalizeString(body.provinceEn) || undefined,
        districtKh: normalizeString(body.districtKh) || undefined,
        districtEn: normalizeString(body.districtEn) || undefined,
        communeKh: normalizeString(body.communeKh) || undefined,
        communeEn: normalizeString(body.communeEn) || undefined,
        village: normalizeString(body.village) || undefined,
        addressDetail: normalizeString(body.addressDetail) || undefined,
        fullAddressKh: normalizeString(body.fullAddressKh) || undefined,
        fullAddressEn: normalizeString(body.fullAddressEn) || undefined,
        status: body.status ? String(body.status).trim().toUpperCase() : "ACTIVE",
    }
}

const validateRequiredShopFields = (payload) => {
    const missing = requiredShopFields.filter((field) => !payload[field])
    if (missing.length > 0) {
        return `${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} required`
    }
    return null
}

const validateShopStatus = (status) => ["ACTIVE", "LOCKED", "SUSPENDED", "EXPIRED", "ARCHIVED"].includes(status)

const findOwnerAdmin = async (ownerAdminId) => {
    return User.findOne({
        _id: ownerAdminId,
        role: ROLES.ADMIN,
        status: "ACTIVE",
    })
}

const validateOwnerAdminAssignment = async (ownerAdminId, currentShopId = null) => {
    const ownerAdmin = await findOwnerAdmin(ownerAdminId)
    if (!ownerAdmin) {
        return {
            status: 400,
            error: "Owner admin must be an active ADMIN user",
        }
    }

    const assignedShopId = ownerAdmin.shopId?.toString()
    if (assignedShopId && (!currentShopId || assignedShopId !== String(currentShopId))) {
        return {
            status: 409,
            error: "Owner admin already has a shop",
        }
    }

    return { ownerAdmin }
}

const handleShopError = (error, res, next) => {
    if (error?.code === 11000 && error?.keyPattern?.code) {
        return res.status(409).json({
            success: false,
            error: "Shop code already exists",
        })
    }
    return next(error)
}

exports.dashboard = async (req, res, next) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [
            totalShops, activeShops, lockedShops, archivedShops,
            totalAdmins, totalCashiers,
            totalProducts, totalCategories, totalSuppliers, totalCustomers,
            salesAgg,
            outOfStockProducts, lowStockProducts,
            activeSubscriptions, expiredSubscriptions, pendingSubscriptions,
            recentShops, recentAdmins,
            salesRevenueTrendAgg, categoryPerformanceAgg
        ] = await Promise.all([
            Shop.countDocuments({ isDeleted: { $ne: true } }),
            Shop.countDocuments({ status: "ACTIVE", isDeleted: { $ne: true } }),
            Shop.countDocuments({ status: "LOCKED", isDeleted: { $ne: true } }),
            Shop.countDocuments({ status: "ARCHIVED" }),

            User.countDocuments({ role: ROLES.ADMIN, isDeleted: { $ne: true } }),
            User.countDocuments({ role: ROLES.CASHIER, isDeleted: { $ne: true } }),

            Product.countDocuments({ isDeleted: { $ne: true } }),
            Category.countDocuments({ isDeleted: { $ne: true } }),
            Supplier.countDocuments({ isDeleted: { $ne: true } }),
            Customer.countDocuments({ isDeleted: { $ne: true } }),

            Sale.aggregate([
                {
                    $facet: {
                        total: [{ $group: { _id: null, sum: { $sum: "$totalCost" } } }],
                        today: [
                            { $match: { createdAt: { $gte: startOfDay } } },
                            { $group: { _id: null, sum: { $sum: "$totalCost" } } }
                        ],
                        monthly: [
                            { $match: { createdAt: { $gte: startOfMonth } } },
                            { $group: { _id: null, sum: { $sum: "$totalCost" } } }
                        ]
                    }
                }
            ]),

            Product.countDocuments({ currentStock: { $lte: 0 }, isDeleted: { $ne: true } }),
            Product.countDocuments({ currentStock: { $gt: 0, $lte: 5 }, isDeleted: { $ne: true } }), // Using 5 as fallback minStock threshold since it's not defined

            Subscription.countDocuments({ status: "Active" }),
            Subscription.countDocuments({ status: "Expired" }),
            Subscription.countDocuments({ paymentStatus: "Unpaid", status: { $ne: "Expired" } }),

            Shop.find({ isDeleted: { $ne: true } }).select("name code status createdAt").sort({ createdAt: -1 }).limit(5),
            User.find({ role: ROLES.ADMIN, isDeleted: { $ne: true } }).select("username email status createdAt").sort({ createdAt: -1 }).limit(5),
            
            Sale.aggregate([
                { $match: { createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } } },
                { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$totalCost" } } },
                { $sort: { "_id": 1 } }
            ]),
            
            Product.aggregate([
                { $group: { _id: "$categoryId", count: { $sum: 1 } } },
                { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
                { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
                { $project: { name: { $ifNull: ["$category.name", "Uncategorized"] }, count: 1 } },
                { $sort: { count: -1 } },
                { $limit: 7 }
            ])
        ])

        const salesRevenueTrend = Array.from({ length: 12 }, (_, i) => {
            const found = salesRevenueTrendAgg.find(item => item._id === i + 1);
            return found ? found.total : 0;
        });

        const subscriptionRevenueTrend = Array.from({ length: 12 }, () => 0); // Placeholder

        const categoryPerformance = categoryPerformanceAgg.map(item => ({
            name: item.name,
            value: item.count
        }));

        const totalSales = salesAgg[0]?.total[0]?.sum || 0;
        const todaySales = salesAgg[0]?.today[0]?.sum || 0;
        const monthlySales = salesAgg[0]?.monthly[0]?.sum || 0;

        res.status(200).json({
            success: true,
            result: {
                totalShops, activeShops, lockedShops, archivedShops,
                totalAdmins, totalCashiers,
                totalProducts, totalCategories, totalSuppliers, totalCustomers,
                totalSales, todaySales, monthlySales,
                lowStockProducts, outOfStockProducts,
                activeSubscriptions, expiredSubscriptions, pendingSubscriptions,
                recentShops, recentAdmins,
                salesRevenueTrend, subscriptionRevenueTrend, categoryPerformance
            }
        })
    } catch (error) {
        next(error)
    }
}

exports.listShops = async (req, res, next) => {
    try {
        const search = req.query.search
        const filter = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { code: { $regex: search, $options: "i" } },
                    { billingPhone: { $regex: search, $options: "i" } },
                    { billingEmail: { $regex: search, $options: "i" } },
                ],
            }
            : {}
        const docs = await Shop.find(filter)
            .populate(shopPopulate)
            .sort({ createdAt: -1 })
            
        const shopsWithCounts = await Promise.all(docs.map(async (shop) => {
            const cashierCount = await User.countDocuments({ shopId: shop._id, role: 'CASHIER' })
            const productCount = await Product.countDocuments({ shopId: shop._id })
            const categoryCount = await Category.countDocuments({ shopId: shop._id })
            
            const hasRelatedData = await Promise.all([
                User.countDocuments({ shopId: shop._id }),
                Location.countDocuments({ shop: shop._id }),
                Sale.countDocuments({ shopId: shop._id }),
                Purchase.countDocuments({ shopId: shop._id }),
                StockMovement.countDocuments({ shopId: shop._id }),
                Receipt.countDocuments({ shopId: shop._id })
            ]).then(counts => counts.some(count => count > 0) || productCount > 0 || categoryCount > 0)
            
            return {
                ...shop.toObject(),
                cashierCount,
                productCount,
                categoryCount,
                hasRelatedData
            }
        }))

        res.status(200).json({ success: true, result: shopsWithCounts })
    } catch (error) {
        next(error)
    }
}

exports.getShop = async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.params.id).populate(shopPopulate)
        if (!shop) {
            return res.status(404).json({ success: false, error: "Shop not found" })
        }
        return res.status(200).json({ success: true, result: shop })
    } catch (error) {
        next(error)
    }
}

exports.createShop = async (req, res, next) => {
    try {
        const payload = normalizeShopPayload(req.body || {})
        const requiredError = validateRequiredShopFields(payload)
        if (requiredError) {
            return res.status(400).json({ success: false, error: requiredError })
        }
        if (!validateShopStatus(payload.status)) {
            return res.status(400).json({ success: false, error: "Invalid shop status" })
        }

        if (!payload.code) {
            payload.code = await generateShopCode()
        }

        const duplicate = await Shop.exists({ code: payload.code })
        if (duplicate) {
            return res.status(409).json({
                success: false,
                error: "Shop code already exists",
            })
        }

        const ownerAdminCheck = await validateOwnerAdminAssignment(payload.ownerAdminId)
        if (ownerAdminCheck.error) {
            return res.status(ownerAdminCheck.status).json({
                success: false,
                error: ownerAdminCheck.error,
            })
        }

        const shop = await Shop.create({
            ...payload,
            createdBy: req.user._id,
        })
        ownerAdminCheck.ownerAdmin.shopId = shop._id
        await ownerAdminCheck.ownerAdmin.save()

        await writeAuditLog(req, "CREATE", "Shop", shop._id)
        
        const Notification = require("../models/Notification.model");
        await Notification.create({
            title: "New Shop Created",
            message: `Shop ${shop.name} (${shop.code}) was created.`,
            type: "SHOP_CREATED",
            shopId: shop._id
        });
        
        await createAdminActivityAlert(req.user, "Shop created", `Shop ${shop.name} (${shop.code}) was created.`, { shopId: shop._id });

        const result = await Shop.findById(shop._id).populate(shopPopulate)
        return res.status(201).json({ success: true, result })
    } catch (error) {
        return handleShopError(error, res, next)
    }
}

exports.updateShop = async (req, res, next) => {
    try {
        const existingShop = await Shop.findById(req.params.id)
        if (!existingShop) {
            return res.status(404).json({ success: false, error: "Shop not found" })
        }

        const payload = normalizeShopPayload({ ...existingShop.toObject(), ...req.body })
        const requiredError = validateRequiredShopFields(payload)
        if (requiredError) {
            return res.status(400).json({ success: false, error: requiredError })
        }
        if (!validateShopStatus(payload.status)) {
            return res.status(400).json({ success: false, error: "Invalid shop status" })
        }

        if (payload.code !== existingShop.code) {
            const duplicate = await Shop.exists({ _id: { $ne: existingShop._id }, code: payload.code })
            if (duplicate) {
                return res.status(409).json({ success: false, error: "Shop code already exists" })
            }
        }

        const ownerAdminCheck = await validateOwnerAdminAssignment(payload.ownerAdminId, existingShop._id)
        if (ownerAdminCheck.error) {
            return res.status(ownerAdminCheck.status).json({
                success: false,
                error: ownerAdminCheck.error,
            })
        }

        const previousOwnerId = existingShop.ownerAdminId?.toString()
        const shop = await Shop.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true, runValidators: true }
        ).populate(shopPopulate)

        ownerAdminCheck.ownerAdmin.shopId = shop._id
        await ownerAdminCheck.ownerAdmin.save()

        if (previousOwnerId && previousOwnerId !== String(ownerAdminCheck.ownerAdmin._id)) {
            await User.updateOne(
                { _id: previousOwnerId, shopId: shop._id },
                { $set: { shopId: null } }
            )
        }

        await writeAuditLog(req, "UPDATE", "Shop", shop._id)
        await createAdminActivityAlert(req.user, "Shop updated", `Shop ${shop.name} (${shop.code}) was updated.`, { shopId: shop._id });
        return res.status(200).json({ success: true, result: shop })
    } catch (error) {
        return handleShopError(error, res, next)
    }
}

exports.updateShopStatus = async (req, res, next) => {
    try {
        const status = String(req.body?.status || "").trim().toUpperCase()
        if (!validateShopStatus(status)) {
            return res.status(400).json({ success: false, error: "Invalid shop status" })
        }

        const shop = await Shop.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate(shopPopulate)

        if (!shop) {
            return res.status(404).json({ success: false, error: "Shop not found" })
        }

        await writeAuditLog(req, "STATUS_CHANGE", "Shop", shop._id, { status })
        await createAdminActivityAlert(req.user, "Shop status changed", `Shop ${shop.name} status changed to ${status}.`, { shopId: shop._id, status });
        return res.status(200).json({ success: true, result: shop })
    } catch (error) {
        return next(error)
    }
}

exports.deleteShop = async (req, res, next) => {
    try {
        const id = req.params.id;
        const [
            assignedUsers,
            assignedLocations,
            assignedProducts,
            assignedCategories,
            assignedSales,
            assignedPurchases,
            assignedStockMovements,
            assignedReceipts
        ] = await Promise.all([
            User.countDocuments({ shopId: id }),
            Location.countDocuments({ shop: id }),
            Product.countDocuments({ shopId: id }),
            Category.countDocuments({ shopId: id }),
            Sale.countDocuments({ shopId: id }),
            Purchase.countDocuments({ shopId: id }),
            StockMovement.countDocuments({ shopId: id }),
            Receipt.countDocuments({ shopId: id })
        ]);

        if (
            assignedUsers > 0 ||
            assignedLocations > 0 ||
            assignedProducts > 0 ||
            assignedCategories > 0 ||
            assignedSales > 0 ||
            assignedPurchases > 0 ||
            assignedStockMovements > 0 ||
            assignedReceipts > 0
        ) {
            return res.status(409).json({
                success: false,
                error: "Shop has related business data and cannot be permanently deleted. Please archive it instead.",
            })
        }

        const shop = await Shop.findByIdAndDelete(id)
        if (!shop) {
            return res.status(404).json({ success: false, error: "Shop not found" })
        }
        await writeAuditLog(req, "DELETE", "Shop", shop._id)
        return res.status(200).json({ success: true, result: shop })
    } catch (error) {
        next(error)
    }
}

exports.archiveShop = async (req, res, next) => {
    try {
        const shop = await Shop.findByIdAndUpdate(
            req.params.id,
            { 
                status: "ARCHIVED",
                isDeleted: true,
                archivedAt: new Date(),
                archivedBy: req.user._id
            },
            { new: true, runValidators: true }
        ).populate(shopPopulate)
        
        if (!shop) {
            return res.status(404).json({ success: false, error: "Shop not found" })
        }
        
        await writeAuditLog(req, "ARCHIVE", "Shop", shop._id)
        
        const Notification = require("../models/Notification.model");
        await Notification.create({
            title: "Shop Archived",
            message: `Shop ${shop.name} (${shop.code}) has been archived.`,
            type: "SHOP_ARCHIVED",
            shopId: shop._id
        });
        
        await createAdminActivityAlert(req.user, "Shop deactivated", `Shop ${shop.name} (${shop.code}) has been deactivated (archived).`, { shopId: shop._id });

        return res.status(200).json({ success: true, result: shop })
    } catch (error) {
        next(error)
    }
}

exports.restoreShop = async (req, res, next) => {
    try {
        const shop = await Shop.findByIdAndUpdate(
            req.params.id,
            { 
                status: "ACTIVE",
                isDeleted: false,
                archivedAt: null,
                archivedBy: null
            },
            { new: true, runValidators: true }
        ).populate(shopPopulate)
        
        if (!shop) {
            return res.status(404).json({ success: false, error: "Shop not found" })
        }
        
        await writeAuditLog(req, "RESTORE", "Shop", shop._id)
        
        const Notification = require("../models/Notification.model");
        await Notification.create({
            title: "Shop Restored",
            message: `Shop ${shop.name} (${shop.code}) has been restored.`,
            type: "SHOP_RESTORED",
            shopId: shop._id
        });
        
        await createAdminActivityAlert(req.user, "Shop restored", `Shop ${shop.name} (${shop.code}) has been restored.`, { shopId: shop._id });

        return res.status(200).json({ success: true, result: shop })
    } catch (error) {
        next(error)
    }
}

exports.listAdmins = async (req, res, next) => {
    try {
        const filter = { role: ROLES.ADMIN }
        if (req.query.available === "true") {
            filter.status = "ACTIVE"
            filter.$or = [
                { shopId: null },
                { shopId: { $exists: false } },
            ]
        }

        const docs = await User.find(filter)
            .select(cleanUserProjection)
            .populate("shopId", "name code status")
            .sort({ createdAt: -1 })
        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}

exports.getAdmin = async (req, res, next) => {
    try {
        const admin = await User.findOne({ _id: req.params.id, role: ROLES.ADMIN })
            .populate("shopId", "name code status")
        if (!admin) {
            return res.status(404).json({ success: false, error: "Admin not found" })
        }
        return res.status(200).json({ success: true, result: admin })
    } catch (error) {
        next(error)
    }
}

exports.createAdmin = async (req, res, next) => {
    try {
        const { username, fullName, email, password, shopId, phone, status } = req.body
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: "Username, email, and password are required",
            })
        }

        if (shopId) {
            const shop = await Shop.findOne({ _id: shopId, status: "ACTIVE" })
            if (!shop) {
                return res.status(400).json({ success: false, error: "Active shop not found" })
            }
        }

        const admin = await User.create({
            username,
            fullName,
            email,
            password: await bcryptjs.hash(password, 10),
            phone: phone || undefined,
            role: ROLES.ADMIN,
            shopId: shopId || null,
            status: status || "ACTIVE",
        })
        await writeAuditLog(req, "CREATE", "User", admin._id, { role: ROLES.ADMIN })
        
        const Notification = require("../models/Notification.model");
        await Notification.create({
            title: "Admin Created",
            message: `Admin user ${admin.username} was created.`,
            type: "ADMIN_CREATED"
        });
        
        await createAdminActivityAlert(req.user, "Admin owner created", `Admin user ${admin.username} was created.`, { userId: admin._id });

        admin.password = undefined
        res.status(201).json({ success: true, result: admin })
    } catch (error) {
        next(error)
    }
}

exports.updateAdmin = async (req, res, next) => {
    try {
        const updates = { ...req.body, role: ROLES.ADMIN }
        if (updates.password) {
            updates.password = await bcryptjs.hash(updates.password, 10)
        } else {
            delete updates.password
        }
        if (updates.shopId) {
            const shop = await Shop.findById(updates.shopId)
            if (!shop) {
                return res.status(400).json({ success: false, error: "Shop not found" })
            }
        }

        const admin = await User.findOneAndUpdate(
            { _id: req.params.id, role: ROLES.ADMIN },
            updates,
            { new: true, runValidators: true }
        ).populate("shopId", "name code status")
        if (!admin) {
            return res.status(404).json({ success: false, error: "Admin not found" })
        }
        await writeAuditLog(req, "UPDATE", "User", admin._id, { role: ROLES.ADMIN })
        return res.status(200).json({ success: true, result: admin })
    } catch (error) {
        next(error)
    }
}

exports.updateAdminStatus = async (req, res, next) => {
    try {
        const status = String(req.body.status || "").toUpperCase()
        if (!["ACTIVE", "INACTIVE"].includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid status" })
        }
        const admin = await User.findOneAndUpdate(
            { _id: req.params.id, role: ROLES.ADMIN },
            { status },
            { new: true, runValidators: true }
        )
        if (!admin) {
            return res.status(404).json({ success: false, error: "Admin not found" })
        }
        await writeAuditLog(req, "STATUS_CHANGE", "User", admin._id, { status })
        return res.status(200).json({ success: true, result: admin })
    } catch (error) {
        next(error)
    }
}

exports.platformReports = async (req, res, next) => {
    try {
        const { shopId, period, startDate, endDate } = req.query;
        if (!shopId) {
            return res.status(400).json({ success: false, error: "shopId is required" });
        }

        const shop = await Shop.findById(shopId).populate("ownerAdminId", "username email");
        if (!shop) {
            return res.status(404).json({ success: false, error: "Shop not found" });
        }

        const matchStage = { shopId: shop._id };

        let start, end;
        const now = new Date();
        
        if (period === 'today') {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        } else if (period === 'week') {
            const day = now.getDay() || 7; 
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        } else if (period === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        } else if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
        }

        if (start && end) {
            matchStage.createdAt = { $gte: start, $lt: end };
        }

        const sales = await Sale.find(matchStage).populate("user", "username fullName").sort({ createdAt: -1 });

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalCost || 0), 0);
        const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

        const trendMap = new Map();
        
        sales.forEach(sale => {
            const date = new Date(sale.createdAt);
            let label;
            if (period === 'today') {
                label = `${date.getHours().toString().padStart(2, '0')}:00`;
            } else {
                label = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            }
            
            if (!trendMap.has(label)) {
                trendMap.set(label, { label, revenue: 0, sales: 0 });
            }
            const data = trendMap.get(label);
            data.revenue += (sale.totalCost || 0);
            data.sales += 1;
        });

        const trend = Array.from(trendMap.values()).sort((a, b) => a.label.localeCompare(b.label));

        const categoryPerformanceAgg = await Product.aggregate([
            { $match: { shopId: shop._id } },
            { $group: { _id: "$categoryId", count: { $sum: 1 } } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            { $project: { name: { $ifNull: ["$category.name", "Uncategorized"] }, count: 1 } },
            { $sort: { count: -1 } },
            { $limit: 7 }
        ]);

        const categoryPerformance = categoryPerformanceAgg.map(item => ({
            name: item.name,
            value: item.count
        }));

        const recentSales = sales.slice(0, 100).map(sale => ({
            saleCode: sale.invoiceNumber || sale._id.toString(),
            cashierName: sale.user?.fullName || sale.user?.username || "Unknown",
            customerName: "Walk-in",
            paymentMethod: "Cash",
            total: sale.totalCost || 0,
            status: sale.paymentStatus || "completed",
            createdAt: sale.createdAt
        }));

        res.status(200).json({
            success: true,
            result: {
                shop: {
                    _id: shop._id,
                    shopCode: shop.code,
                    name: shop.name,
                    status: shop.status,
                    ownerAdmin: shop.ownerAdminId?.username || shop.ownerAdminId?.email || "Unknown"
                },
                summary: {
                    totalRevenue,
                    totalSales,
                    averageSale,
                    shopStatus: shop.status
                },
                trend,
                categoryPerformance,
                recentSales
            }
        });
    } catch (error) {
        next(error);
    }
}

exports.auditLogs = async (req, res, next) => {
    try {
        const docs = await AuditLog.find()
            .populate("user", "username email role")
            .populate("shopId", "name code")
            .sort({ createdAt: -1 })
            .limit(200)
        res.status(200).json({ success: true, result: docs })
    } catch (error) {
        next(error)
    }
}

const getCurrentStockAlerts = async () => {
    const Product = require("../models/Product.model");
    const products = await Product.find({ isDeleted: { $ne: true } })
        .populate("shopId", "name shopName shopCode")
        .lean();
    const alerts = [];
    let lowCount = 0;
    let criticalCount = 0;
    let outCount = 0;

    for (const p of products) {
        const quantity = Number(p.quantity ?? p.stock ?? p.currentStock ?? 0);
        const reorder = Number(p.reorderLevel ?? p.lowStockAlert ?? p.minStock ?? p.minimumStock ?? 0);
        
        if (reorder > 0) {
            let type = null;
            let alertTitle = "";
            let message = "";
            let severity = "INFO";

            if (quantity <= 0) {
                outCount++;
                type = "OUT_OF_STOCK";
                alertTitle = "Out of stock detected";
                message = `${p.name} is out of stock. Quantity: ${quantity}, reorder level: ${reorder}.`;
                severity = "CRITICAL";
            } else if (quantity <= Math.ceil(reorder / 2)) {
                criticalCount++;
                type = "CRITICAL_STOCK";
                alertTitle = "Critical stock detected";
                message = `${p.name} is critically low stock. Quantity: ${quantity}, reorder level: ${reorder}.`;
                severity = "CRITICAL";
            } else if (quantity <= reorder) {
                lowCount++;
                type = "LOW_STOCK";
                alertTitle = "Low stock detected";
                message = `${p.name} is low stock. Quantity: ${quantity}, reorder level: ${reorder}.`;
                severity = "WARNING";
            }

            if (type) {
                const shopNameFallback = p.shopId?.name || p.shopId?.shopName || "-";
                alerts.push({
                    _id: p._id.toString() + "_" + type,
                    time: p.updatedAt || p.createdAt || new Date(),
                    createdAt: p.updatedAt || p.createdAt || new Date(),
                    alert: alertTitle,
                    title: alertTitle,
                    severity: severity,
                    shopName: shopNameFallback,
                    shopId: p.shopId,
                    userId: { username: "-" },
                    userName: "-",
                    message: message,
                    type: type,
                    isRead: false
                });
            }
        }
    }
    
    alerts.sort((a, b) => new Date(b.time) - new Date(a.time));
    return { alerts, lowCount, criticalCount, outCount };
};

exports.alerts = async (req, res, next) => {
    try {
        const Notification = require("../models/Notification.model");

        const stockData = await getCurrentStockAlerts();

        const dbAlerts = await Notification.find({ roleTarget: "ADMIN_MANAGER" })
            .populate("shopId", "name code")
            .populate("userId", "username email")
            .sort({ createdAt: -1 })
            .limit(100);

        const summary = {
            loginAlerts: 0,
            failedLoginAlerts: 0,
            lowStockAlerts: stockData.lowCount,
            criticalStockAlerts: stockData.criticalCount,
            outOfStockAlerts: stockData.outCount,
            suspiciousActivityAlerts: 0
        };

        const mappedDbAlerts = dbAlerts.map(a => {
            if (a.type === "LOGIN_SUCCESS") summary.loginAlerts++;
            if (a.type === "LOGIN_FAILED") summary.failedLoginAlerts++;
            if (a.type === "SUSPICIOUS_ACTIVITY") summary.suspiciousActivityAlerts++;
            
            return {
                _id: a._id,
                time: a.createdAt,
                createdAt: a.createdAt,
                alert: a.title,
                title: a.title,
                severity: a.severity,
                shopName: a.shopId?.name || "Platform",
                shopId: a.shopId,
                userName: a.userId?.username || "-",
                message: a.message,
                type: a.type,
                isRead: a.isRead
            };
        });

        const filteredDbAlerts = mappedDbAlerts.filter(a => !["LOW_STOCK", "CRITICAL_STOCK", "OUT_OF_STOCK"].includes(a.type));

        const allAlerts = [...stockData.alerts, ...filteredDbAlerts];
        allAlerts.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.status(200).json({
            success: true,
            data: {
                alerts: allAlerts.slice(0, 100),
                summary
            }
        });
    } catch (error) {
        next(error);
    }
}

exports.systemHealth = async (req, res, next) => {
    try {
        const mongoose = require('mongoose');
        const fs = require('fs');
        const path = require('path');

        const getDirSizeMB = (dirPath) => {
            let size = 0;
            try {
                if (!fs.existsSync(dirPath)) return 0;
                const files = fs.readdirSync(dirPath);
                for (let i = 0; i < files.length; i++) {
                    const filePath = path.join(dirPath, files[i]);
                    const stats = fs.statSync(filePath);
                    if (stats.isFile()) {
                        size += stats.size;
                    } else if (stats.isDirectory()) {
                        // Just simple 1-level size for safety or mock recursion
                    }
                }
            } catch (e) {
                return 0;
            }
            return size / (1024 * 1024);
        };

        const getBackups = (dirPath) => {
            let backupsList = [];
            try {
                if (!fs.existsSync(dirPath)) return backupsList;
                const files = fs.readdirSync(dirPath);
                for (let i = 0; i < files.length; i++) {
                    const filePath = path.join(dirPath, files[i]);
                    const stats = fs.statSync(filePath);
                    if (stats.isFile() && files[i].includes('backup')) {
                        backupsList.push({
                            fileName: files[i],
                            sizeMB: stats.size / (1024 * 1024),
                            createdAt: stats.mtime.toISOString(),
                            status: "SUCCESS"
                        });
                    }
                }
                backupsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } catch (e) {
                return [];
            }
            return backupsList;
        };

        const uploadsDir = path.join(__dirname, '..', 'upload');
        const backupsDir = path.join(__dirname, '..', 'backups');
        const logsDir = path.join(__dirname, '..', 'logs');

        const uploadsSizeMB = getDirSizeMB(uploadsDir);
        const backupsSizeMB = getDirSizeMB(backupsDir);
        const logsSizeMB = getDirSizeMB(logsDir);

        const backups = getBackups(backupsDir);

        let pingMs = 0;
        try {
            const startPing = Date.now();
            await mongoose.connection.db.admin().ping();
            pingMs = Date.now() - startPing;
        } catch(e) {
            pingMs = -1;
        }

        const dbState = mongoose.connection.readyState; // 1 = connected

        const result = {
            api: {
                status: "ONLINE",
                uptimeSeconds: process.uptime(),
                responseTimeMs: 0, // This is current request, can't measure easily without interceptor
                nodeVersion: process.version,
                environment: process.env.NODE_ENV || "development"
            },
            mongodb: {
                status: dbState === 1 ? "CONNECTED" : "DISCONNECTED",
                databaseName: mongoose.connection.name || "unknown",
                host: mongoose.connection.host || "unknown",
                readyState: dbState,
                pingMs
            },
            storage: {
                uploadsSizeMB,
                backupsSizeMB,
                logsSizeMB
            },
            backup: {
                lastBackupAt: backups.length > 0 ? backups[0].createdAt : null,
                lastBackupStatus: backups.length > 0 ? "SUCCESS" : "NONE",
                totalBackups: backups.length
            },
            backups,
            checkedAt: new Date().toISOString()
        };

        res.status(200).json({ success: true, result });
    } catch (error) {
        next(error);
    }
};

exports.listBackups = async (req, res, next) => {
    try {
        // Obsolete if frontend gets from systemHealth directly, but keep for compatibility
        res.status(200).json({ success: true, result: [] });
    } catch (error) {
        next(error);
    }
};

exports.createBackup = async (req, res, next) => {
    try {
        const { spawn } = require('child_process');
        const path = require('path');
        const fs = require('fs');

        const dbUri = process.env.MONGODB_URI;
        if (!dbUri) {
            return res.status(400).json({ success: false, message: "Missing MONGODB_URI. Cannot create backup." });
        }

        const backupsDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
        }

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const fileName = `kambuja-pos-backup-${year}-${month}-${day}-${hours}-${minutes}.archive.gz`;
        const outputPath = path.join(backupsDir, fileName);

        const isWindows = process.platform === "win32";
        const mongoDumpCommand = isWindows ? "mongodump.exe" : "mongodump";
        
        const args = [
            '--uri', dbUri,
            `--archive=${outputPath}`,
            '--gzip'
        ];

        let responded = false;
        const mongodumpProcess = spawn(mongoDumpCommand, args);

        mongodumpProcess.on('error', async (err) => {
            if (responded) return;
            responded = true;
            
            const Notification = require("../models/Notification.model");
            await Notification.create({
                title: "Backup Failed",
                message: err.code === 'ENOENT' ? "MongoDB Database Tools not installed." : err.message,
                type: "BACKUP_FAILED"
            });

            if (err.code === 'ENOENT') {
                return res.status(500).json({ success: false, message: "MongoDB Database Tools is not installed or mongodump is not available in PATH." });
            }
            return res.status(500).json({ success: false, message: `Backup process error: ${err.message}` });
        });

        mongodumpProcess.on('close', async (code) => {
            if (responded) return;
            responded = true;
            
            const Notification = require("../models/Notification.model");
            
            if (code === 0 && fs.existsSync(outputPath)) {
                const stats = fs.statSync(outputPath);
                const sizeMB = stats.size / (1024 * 1024);
                
                await Notification.create({
                    title: "Backup Success",
                    message: `Database backup ${fileName} created successfully.`,
                    type: "BACKUP_SUCCESS"
                });

                return res.status(200).json({
                    success: true,
                    result: {
                        fileName,
                        sizeMB,
                        createdAt: stats.mtime.toISOString(),
                        status: "SUCCESS"
                    }
                });
            } else {
                await Notification.create({
                    title: "Backup Failed",
                    message: "Backup file was not created or command failed.",
                    type: "BACKUP_FAILED"
                });
                return res.status(500).json({ success: false, message: "Backup file was not created or command failed." });
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteBackup = async (req, res, next) => {
    try {
        const fs = require('fs');
        const path = require('path');
        
        const fileName = req.params.id;
        if (!fileName || typeof fileName !== 'string' || fileName.includes('/') || fileName.includes('\\') || fileName.includes('..') || !fileName.endsWith('.gz')) {
             return res.status(400).json({ success: false, message: "Invalid backup file name." });
        }
        
        const backupsDir = path.join(__dirname, '..', 'backups');
        const filePath = path.join(backupsDir, fileName);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ success: true, message: "Backup deleted successfully." });
        } else {
            res.status(404).json({ success: false, message: "Backup file not found." });
        }
    } catch (error) {
        next(error);
    }
};

exports.downloadBackup = async (req, res, next) => {
    try {
        const fs = require('fs');
        const path = require('path');
        
        const fileName = req.params.id;
        if (!fileName || typeof fileName !== 'string' || fileName.includes('/') || fileName.includes('\\') || fileName.includes('..') || !fileName.endsWith('.gz')) {
             return res.status(400).send("Invalid backup file name.");
        }
        
        const backupsDir = path.join(__dirname, '..', 'backups');
        const filePath = path.join(backupsDir, fileName);
        
        if (fs.existsSync(filePath)) {
            res.download(filePath, fileName);
        } else {
            res.status(404).send("Backup file not found.");
        }
    } catch (error) {
        next(error);
    }
};

exports.getNotifications = async (req, res, next) => {
    try {
        const Notification = require("../models/Notification.model");
        const limit = parseInt(req.query.limit) || 10;
        
        const notifications = await Notification.find({ roleTarget: "ADMIN_MANAGER" })
            .populate("shopId", "name")
            .sort({ createdAt: -1 })
            .limit(limit);
        
        let mapped = notifications.map(n => ({
            _id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            severity: n.severity,
            shopId: n.shopId,
            createdAt: n.createdAt,
            isRead: n.isRead
        })).filter(a => !["LOW_STOCK", "CRITICAL_STOCK", "OUT_OF_STOCK"].includes(a.type));

        const stockData = await getCurrentStockAlerts();
        
        mapped = [...stockData.alerts, ...mapped];
        mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ success: true, data: mapped.slice(0, limit) });
    } catch (error) {
        next(error);
    }
};

exports.getUnreadCount = async (req, res, next) => {
    try {
        const Notification = require("../models/Notification.model");
        const count = await Notification.countDocuments({
            roleTarget: "ADMIN_MANAGER",
            isRead: false,
            type: { $nin: ["LOW_STOCK", "CRITICAL_STOCK", "OUT_OF_STOCK"] }
        });
        
        const stockData = await getCurrentStockAlerts();
        
        res.status(200).json({ success: true, count: count + stockData.lowCount + stockData.criticalCount + stockData.outCount });
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const Notification = require("../models/Notification.model");
        await Notification.findByIdAndUpdate(req.params.id, {
            isRead: true,
            readAt: new Date()
        });
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        const Notification = require("../models/Notification.model");
        await Notification.updateMany(
            { roleTarget: "ADMIN_MANAGER", isRead: false },
            { isRead: true, readAt: new Date() }
        );
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};
