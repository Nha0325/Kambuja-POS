const Unit = require("../models/Unit.model");

exports.create = async (req, res, next) => {
    try {
        const { nameKh, nameEn, code, type, isActive } = req.body;
        const unit = await Unit.create({
            nameKh, nameEn, code, type, isActive, createdBy: req.user?._id || req.user?.id
        });
        res.status(201).json({ success: true, result: unit });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Unit code already exists" });
        }
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const unit = await Unit.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });
        res.status(200).json({ success: true, result: unit });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Unit code already exists" });
        }
        next(error);
    }
};

exports.list = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }
        const units = await Unit.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, result: units });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;
        const unit = await Unit.findByIdAndDelete(id);
        if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });
        res.status(200).json({ success: true, message: "Unit deleted" });
    } catch (error) {
        next(error);
    }
};
