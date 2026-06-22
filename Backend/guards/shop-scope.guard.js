const { ROLES, normalizeRole } = require("../constants/roles")

const shopScopeGuard = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized access",
        })
    }

    const role = normalizeRole(req.user.role)
    if (role === ROLES.ADMIN_MANAGER) {
        req.shopFilter = {}
        return next()
    }

    if (!req.user.shopId) {
        return res.status(403).json({
            success: false,
            error: "Your account is not assigned to a shop",
        })
    }

    req.shopId = req.user.shopId
    req.shopFilter = { shopId: req.user.shopId }
    return next()
}

module.exports = shopScopeGuard
