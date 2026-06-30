const Alert = require('../models/system/Alert.model');
const telegramService = require("../services/telegram.service");

exports.createAlert = async (payload) => {
    try {
        const alert = await Alert.create(payload);
        
        // Optional Telegram notification
        if (telegramService && telegramService.sendMessage) {
            const urgentTypes = ['FAILED_LOGIN', 'CRITICAL_STOCK', 'OUT_OF_STOCK', 'SUBSCRIPTION_EXPIRY', 'SUSPICIOUS_ACTIVITY', 'LOGIN'];
            if (urgentTypes.includes(payload.type)) {
                telegramService.sendMessage(`<b>[${payload.type}]</b> ${payload.title}\n${payload.message}`).catch(() => {});
            }
        }
        
        try {
            const io = require('../config/socket').getIO();
            io.to('ADMIN_MANAGER').emit('system_alert', {
                type: payload.type,
                severity: payload.severity || 'INFO',
                title: payload.title,
                message: payload.message,
                createdAt: new Date()
            });
        } catch(e) {
            // socket might not be initialized yet
        }
        
        return alert;
    } catch (error) {
        console.error("Error creating alert:", error);
    }
};

exports.createLoginAlert = async (user, req) => {
    const roleName = user.role === 'ADMIN_MANAGER' ? 'Admin Manager' : user.role === 'ADMIN' ? 'Admin' : 'Cashier';
    return exports.createAlert({
        type: 'LOGIN',
        severity: 'INFO',
        title: `${roleName} login`,
        message: `${user.username || user.email || user.firstName} logged in as ${roleName}.`,
        userId: user._id,
        shopId: user.shopId ? (user.shopId._id || user.shopId) : null,
        metadata: {
            userName: user.username,
            userRole: user.role,
            ip: req?.ip,
            userAgent: req?.headers?.['user-agent']
        }
    });
};

exports.createFailedLoginAlert = async (identifier, reason, req) => {
    return exports.createAlert({
        type: 'FAILED_LOGIN',
        severity: 'WARNING',
        title: 'Failed login attempt',
        message: `Failed login attempt for ${identifier}.`,
        metadata: {
            reason,
            ip: req?.ip,
            userAgent: req?.headers?.['user-agent']
        }
    });
};

exports.createStockAlert = async (product, shop, type) => {
    let severity = 'INFO';
    let message = '';

    if (type === 'OUT_OF_STOCK') {
        severity = 'CRITICAL';
        message = `Product ${product.name} is out of stock.`;
    } else if (type === 'CRITICAL_STOCK') {
        severity = 'WARNING';
        message = `Product ${product.name} is critically low on stock.`;
    } else if (type === 'LOW_STOCK') {
        severity = 'INFO';
        message = `Product ${product.name} is low on stock.`;
    }

    if (type) {
        const shopId = shop ? shop._id : product.shopId;
        const lastAlert = await Alert.findOne({ 'metadata.productId': product._id, shopId: shopId }).sort({ createdAt: -1 });
        
        if (lastAlert && lastAlert.type === type && !lastAlert.read) {
            return;
        }

        return exports.createAlert({
            shopId: shopId,
            type: type,
            severity: severity,
            title: 'Stock Alert',
            message: message,
            metadata: { productId: product._id }
        });
    }
};

exports.createAdminActivityAlert = async (actor, action, message, metadata) => {
    return exports.createAlert({
        type: 'ADMIN_ACTIVITY',
        severity: 'INFO',
        title: action,
        message: message,
        userId: actor?._id,
        metadata: {
            ...metadata,
            actorName: actor?.username
        }
    });
};

// Keep existing function signature for backward compatibility
exports.checkStockAndAlert = async (product) => {
    try {
        const stock = Number(product.stock ?? product.stockQtyBase ?? product.currentStock ?? 0);
        let reorderLevel = 10; // default

        // Fetch reorderLevel from Inventory
        const Inventory = require('../models/inventory/Inventory.model');
        const inventory = await Inventory.findOne({ product: product._id, shopId: product.shopId });
        if (inventory && inventory.reorderLevel !== undefined) {
            reorderLevel = Number(inventory.reorderLevel);
        } else if (product.lowStockThreshold !== undefined || product.reorderLevel !== undefined) {
            reorderLevel = Number(product.lowStockThreshold ?? product.reorderLevel);
        }

        let type = null;

        if (stock <= 0) {
            type = 'OUT_OF_STOCK';
        } else if (stock <= reorderLevel / 2) {
            type = 'CRITICAL_STOCK';
        } else if (stock <= reorderLevel) {
            type = 'LOW_STOCK';
        }

        if (type) {
            await exports.createStockAlert(product, null, type);
        }
    } catch (error) {
        console.error("Error creating stock alert:", error);
    }
};
