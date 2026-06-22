const AuditLog = require("../models/AuditLog.model")

const writeAuditLog = async (req, action, entityType, entityId = null, metadata = {}) => {
    await AuditLog.create({
        shopId: req.user?.shopId || null,
        user: req.user?._id || null,
        action,
        entityType,
        entityId,
        metadata,
    })
}

module.exports = {
    writeAuditLog,
}
