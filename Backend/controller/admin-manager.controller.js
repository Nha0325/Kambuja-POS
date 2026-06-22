const bcryptjs = require("bcryptjs")
const Shop = require("../models/Shop.model")
const User = require("../models/User.model")
const Sale = require("../models/Sale.model")
const AuditLog = require("../models/AuditLog.model")
const { ROLES } = require("../constants/roles")
const { writeAuditLog } = require("../helper/audit")
const { generateShopCode } = require("./counter.controller")

const requiredShopFields = ["name", "ownerAdminId", "provinceName", "districtName"]

const cleanUserProjection = "username email role status shopId"
const shopPopulate = [
    { path: "ownerAdminId", select: cleanUserProjection },
    { path: "createdBy", select: "username email role" },
]

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "")

const cleanAddressItem = (item) => {
    if (!item || typeof item !== "object") return null
    return {
        code: normalizeString(item.code),
        nameEn: normalizeString(item.nameEn),
        nameKm: normalizeString(item.nameKm),
    }
}

const normalizeAddress = (address) => {
    if (!address) return { address: undefined }

    if (typeof address === "string") {
        return {
            address: normalizeString(address) || undefined,
            addressDetail: normalizeString(address) || undefined,
        }
    }

    if (typeof address !== "object") return { address: undefined }

    const province = cleanAddressItem(address.province)
    const district = cleanAddressItem(address.district)
    const commune = cleanAddressItem(address.commune)
    const village = cleanAddressItem(address.village)
    const detail = normalizeString(address.detail)

    return {
        address: {
            province,
            district,
            commune,
            village,
            detail,
        },
        provinceCode: province?.code || undefined,
        provinceName: province?.nameEn || province?.nameKm || undefined,
        districtCode: district?.code || undefined,
        districtName: district?.nameEn || district?.nameKm || undefined,
        communeCode: commune?.code || undefined,
        communeName: commune?.nameEn || commune?.nameKm || undefined,
        villageCode: village?.code || undefined,
        villageName: village?.nameEn || village?.nameKm || undefined,
        addressDetail: detail || undefined,
    }
}

const normalizeShopPayload = (body) => {
    const normalizedAddress = normalizeAddress(body.address)
    const provinceName = normalizedAddress.provinceName
        || normalizeString(body.provinceName)
        || normalizeString(body.province)
    const districtName = normalizedAddress.districtName
        || normalizeString(body.districtName)
        || normalizeString(body.city)

    return {
        name: normalizeString(body.name),
        code: normalizeString(body.code).toUpperCase() || undefined,
        ownerAdminId: body.ownerAdminId,
        phone: normalizeString(body.phone) || undefined,
        address: normalizedAddress.address,
        provinceCode: normalizedAddress.provinceCode || normalizeString(body.provinceCode) || undefined,
        provinceName,
        districtCode: normalizedAddress.districtCode || normalizeString(body.districtCode) || undefined,
        districtName,
        communeCode: normalizedAddress.communeCode || normalizeString(body.communeCode) || undefined,
        communeName: normalizedAddress.communeName || normalizeString(body.communeName) || undefined,
        villageCode: normalizedAddress.villageCode || normalizeString(body.villageCode) || undefined,
        villageName: normalizedAddress.villageName || normalizeString(body.villageName) || undefined,
        addressDetail: normalizedAddress.addressDetail || normalizeString(body.addressDetail) || undefined,
        province: provinceName,
        city: districtName,
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

const validateShopStatus = (status) => ["ACTIVE", "INACTIVE"].includes(status)

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
        const [shops, admins, cashiers, sales] = await Promise.all([
            Shop.countDocuments(),
            User.countDocuments({ role: ROLES.ADMIN }),
            User.countDocuments({ role: ROLES.CASHIER }),
            Sale.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalCost" },
                        totalSales: { $sum: 1 },
                    },
                },
            ]),
        ])

        res.status(200).json({
            success: true,
            result: {
                totalShops: shops,
                totalAdmins: admins,
                totalCashiers: cashiers,
                totalSales: sales[0]?.totalSales || 0,
                totalRevenue: sales[0]?.totalRevenue || 0,
            },
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
                    { provinceName: { $regex: search, $options: "i" } },
                    { districtName: { $regex: search, $options: "i" } },
                    { province: { $regex: search, $options: "i" } },
                    { city: { $regex: search, $options: "i" } },
                ],
            }
            : {}
        const docs = await Shop.find(filter)
            .populate(shopPopulate)
            .sort({ createdAt: -1 })
        res.status(200).json({ success: true, result: docs })
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
        return res.status(200).json({ success: true, result: shop })
    } catch (error) {
        return next(error)
    }
}

exports.deleteShop = async (req, res, next) => {
    try {
        const assignedUsers = await User.countDocuments({ shopId: req.params.id })
        if (assignedUsers > 0) {
            return res.status(409).json({
                success: false,
                error: "Shop has assigned users and cannot be deleted",
            })
        }

        const shop = await Shop.findByIdAndDelete(req.params.id)
        if (!shop) {
            return res.status(404).json({ success: false, error: "Shop not found" })
        }
        await writeAuditLog(req, "DELETE", "Shop", shop._id)
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
        const { username, email, password, shopId } = req.body
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
            email,
            password: await bcryptjs.hash(password, 10),
            role: ROLES.ADMIN,
            shopId: shopId || null,
            status: "ACTIVE",
        })
        await writeAuditLog(req, "CREATE", "User", admin._id, { role: ROLES.ADMIN })
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
        const sales = await Sale.aggregate([
            {
                $group: {
                    _id: "$shopId",
                    totalRevenue: { $sum: "$totalCost" },
                    totalSales: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "shops",
                    localField: "_id",
                    foreignField: "_id",
                    as: "shop",
                },
            },
            { $unwind: { path: "$shop", preserveNullAndEmptyArrays: true } },
            { $sort: { totalRevenue: -1 } },
        ])
        res.status(200).json({ success: true, result: sales })
    } catch (error) {
        next(error)
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
