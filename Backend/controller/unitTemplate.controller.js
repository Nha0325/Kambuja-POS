const UnitConversionTemplate = require("../models/UnitConversionTemplate.model");

exports.create = async (req, res, next) => {
    try {
        const { templateName, baseUnit, purchaseUnit, unitsPerPurchaseUnit, exampleText, isActive } = req.body;
        const template = await UnitConversionTemplate.create({
            templateName, baseUnit, purchaseUnit, unitsPerPurchaseUnit, exampleText, isActive, createdBy: req.user?._id || req.user?.id
        });
        const populated = await UnitConversionTemplate.findById(template._id).populate('baseUnit').populate('purchaseUnit');
        res.status(201).json({ success: true, result: populated });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const template = await UnitConversionTemplate.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate('baseUnit').populate('purchaseUnit');
        if (!template) return res.status(404).json({ success: false, message: "Template not found" });
        res.status(200).json({ success: true, result: template });
    } catch (error) {
        next(error);
    }
};

exports.list = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }
        const templates = await UnitConversionTemplate.find(filter).populate('baseUnit').populate('purchaseUnit').sort({ createdAt: -1 });
        res.status(200).json({ success: true, result: templates });
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;
        const template = await UnitConversionTemplate.findByIdAndDelete(id);
        if (!template) return res.status(404).json({ success: false, message: "Template not found" });
        res.status(200).json({ success: true, message: "Template deleted" });
    } catch (error) {
        next(error);
    }
};
