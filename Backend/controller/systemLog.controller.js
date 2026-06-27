const SystemLog = require("../models/SystemLog");

exports.getSystemLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, search, action, role, shopId, startDate, endDate } = req.query;
        
        const filter = {};
        
        if (action && action !== "ALL") filter.action = action;
        if (role) filter.role = role;
        if (shopId) filter.shopId = shopId;
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { userName: regex },
                { userEmail: regex },
                { shopName: regex },
                { action: regex },
                { entity: regex },
                { message: regex }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const logs = await SystemLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await SystemLog.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getSystemLogStats = async (req, res, next) => {
    try {
        const total = await SystemLog.countDocuments();
        const actionTypes = await SystemLog.distinct("action");
        const latestLog = await SystemLog.findOne().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                total,
                actionTypesCount: actionTypes.length,
                latestTime: latestLog ? latestLog.createdAt : null
            }
        });
    } catch (error) {
        next(error);
    }
};
