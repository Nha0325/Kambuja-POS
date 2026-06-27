const Location = require("../models/Location.model")

exports.getAll = async (req, res, next) => {
    try {
        const filter = {}
        if (req.query.shopId) filter.shop = req.query.shopId

        const locations = await Location.find(filter)
            .populate("shop", "name code")
            .populate("manager", "username email phone")
            .sort({ createdAt: -1 })
        res.status(200).json({ success: true, data: locations })
    } catch (error) {
        next(error)
    }
}

exports.getSummary = async (req, res, next) => {
    try {
        const [totalLocations, totalProvinces, totalDistricts, mappedShops] = await Promise.all([
            Location.countDocuments(),
            Location.distinct("province").then(res => res.filter(Boolean).length),
            Location.distinct("district").then(res => res.filter(Boolean).length),
            Location.countDocuments({ shop: { $ne: null } })
        ])

        res.status(200).json({
            success: true,
            data: { totalLocations, totalProvinces, totalDistricts, mappedShops }
        })
    } catch (error) {
        next(error)
    }
}

exports.create = async (req, res, next) => {
    try {
        const location = await Location.create(req.body)
        res.status(201).json({ success: true, data: location })
    } catch (error) {
        next(error)
    }
}

exports.update = async (req, res, next) => {
    try {
        const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!location) return res.status(404).json({ success: false, message: "Location not found" })
        res.status(200).json({ success: true, data: location })
    } catch (error) {
        next(error)
    }
}

exports.remove = async (req, res, next) => {
    try {
        const location = await Location.findByIdAndDelete(req.params.id)
        if (!location) return res.status(404).json({ success: false, message: "Location not found" })
        res.status(200).json({ success: true, data: location })
    } catch (error) {
        next(error)
    }
}
