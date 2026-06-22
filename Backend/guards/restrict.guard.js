const { normalizeRole } = require("../constants/roles")

const restrict = (...allowedRoles) => (req, res, next) => {

    if(!req. user){
        return res.status(401).json({
            success: false,
            error: "Unauthorized access"
            
        })
    }

    const role = normalizeRole(req.user.role)
    const normalizedAllowedRoles = allowedRoles.map(normalizeRole)

    if(normalizedAllowedRoles.includes(role)){
        return next()
    }

    return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action!"
    })

}

module.exports = restrict
