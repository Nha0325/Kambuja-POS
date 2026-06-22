const { normalizeRole } = require("../constants/roles")

/**
 * Role-based access control middleware factory.
 *
 * Usage:
 *   router.use(allowRoles("ADMIN_MANAGER", "ADMIN"))
 *   router.get("/resource", allowRoles("ADMIN"), handler)
 *
 * @param  {...string} roles - Allowed role strings (normalized internally).
 * @returns Express middleware
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: No authenticated user found.",
      })
    }

    const userRole = normalizeRole(req.user?.role)

    if (!userRole || !roles.map(normalizeRole).includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: You do not have permission to access this resource.",
      })
    }

    next()
  }
}

module.exports = allowRoles
