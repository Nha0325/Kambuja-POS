const Alert = require('../../models/system/Alert.model');

exports.getAlerts = async (req, res, next) => {
    try {
        const { search, type, severity, shopId, read, page = 1, limit = 10, alertId } = req.query;
        
        let filter = { ...req.shopFilter };
        
        if (shopId && !req.shopFilter.shopId) {
            filter.shopId = shopId;
        }

        if (type) filter.type = type;
        if (severity) filter.severity = severity;
        if (read !== undefined) filter.read = read === 'true';
        if (alertId) filter._id = alertId;

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }
        
        const alerts = await Alert.find(filter)
            .populate('shopId', 'name')
            .populate('userId', 'firstName lastName username')
            .sort({ createdAt: -1 });

        const summary = {
            loginAlerts: 0,
            failedLoginAlerts: 0,
            lowStockAlerts: 0,
            criticalStockAlerts: 0,
            outOfStockAlerts: 0,
            suspiciousActivityAlerts: 0,
            subscriptionExpiryAlerts: 0,
            adminActivityAlerts: 0,
            totalUnread: 0
        };

        const allAlertsForSummary = await Alert.find(req.shopFilter);
        allAlertsForSummary.forEach(alert => {
            if (!alert.read) summary.totalUnread++;
            if (alert.type === 'LOGIN') summary.loginAlerts++;
            else if (alert.type === 'FAILED_LOGIN') summary.failedLoginAlerts++;
            else if (alert.type === 'LOW_STOCK') summary.lowStockAlerts++;
            else if (alert.type === 'CRITICAL_STOCK') summary.criticalStockAlerts++;
            else if (alert.type === 'OUT_OF_STOCK') summary.outOfStockAlerts++;
            else if (alert.type === 'SUSPICIOUS_ACTIVITY') summary.suspiciousActivityAlerts++;
            else if (alert.type === 'SUBSCRIPTION_EXPIRY') summary.subscriptionExpiryAlerts++;
            else if (alert.type === 'ADMIN_ACTIVITY') summary.adminActivityAlerts++;
        });

        res.status(200).json({
            success: true,
            result: {
                alerts,
                summary
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAlertSummary = async (req, res, next) => {
    try {
        const filter = { ...req.shopFilter };
        const alerts = await Alert.find(filter);
        
        let loginAlerts = 0;
        let failedLoginAlerts = 0;
        let lowStockAlerts = 0;
        let criticalStockAlerts = 0;
        let outOfStockAlerts = 0;
        let suspiciousActivityAlerts = 0;
        let unreadNotifications = 0;

        alerts.forEach(alert => {
            if (!alert.read) unreadNotifications++;
            if (alert.type === 'LOGIN') loginAlerts++;
            else if (alert.type === 'FAILED_LOGIN') failedLoginAlerts++;
            else if (alert.type === 'LOW_STOCK') lowStockAlerts++;
            else if (alert.type === 'CRITICAL_STOCK') criticalStockAlerts++;
            else if (alert.type === 'OUT_OF_STOCK') outOfStockAlerts++;
            else if (alert.type === 'SUSPICIOUS_ACTIVITY') suspiciousActivityAlerts++;
        });

        res.status(200).json({
            success: true,
            result: {
                loginAlerts,
                failedLoginAlerts,
                lowStockAlerts,
                criticalStockAlerts,
                outOfStockAlerts,
                suspiciousActivityAlerts,
                unreadNotifications
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id, ...req.shopFilter };
        const alert = await Alert.findOneAndUpdate(filter, { read: true }, { new: true });
        if (!alert) {
            return res.status(404).json({ success: false, message: "Alert not found!" });
        }
        res.status(200).json({ success: true, result: alert });
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        const filter = { read: false, ...req.shopFilter };
        await Alert.updateMany(filter, { read: true });
        res.status(200).json({ success: true, message: "All alerts marked as read" });
    } catch (error) {
        next(error);
    }
};

exports.deleteAlert = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id, ...req.shopFilter };
        const alert = await Alert.findOneAndDelete(filter);
        if (!alert) {
            return res.status(404).json({ success: false, message: "Alert not found!" });
        }
        res.status(200).json({ success: true, message: "Alert deleted" });
    } catch (error) {
        next(error);
    }
};

exports.resolveAlert = async (req, res, next) => {
    try {
        const filter = { _id: req.params.id, ...req.shopFilter };
        const alert = await Alert.findOneAndUpdate(filter, { read: true, status: 'resolved' }, { new: true });
        if (!alert) {
            return res.status(404).json({ success: false, message: "Alert not found!" });
        }
        res.status(200).json({ success: true, result: alert });
    } catch (error) {
        next(error);
    }
};
