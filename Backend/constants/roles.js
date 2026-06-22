const ROLES = Object.freeze({
    ADMIN_MANAGER: "ADMIN_MANAGER",
    ADMIN: "ADMIN",
    CASHIER: "CASHIER",
})

const ROLE_ALIASES = Object.freeze({
    super: ROLES.ADMIN_MANAGER,
    admin_manager: ROLES.ADMIN_MANAGER,
    manager: ROLES.ADMIN_MANAGER,
    admin: ROLES.ADMIN,
    cashier: ROLES.CASHIER,
})

const normalizeRole = (role) => {
    if (!role) return role

    const normalized = String(role).trim()
    return ROLE_ALIASES[normalized.toLowerCase()] || normalized.toUpperCase()
}

module.exports = {
    ROLES,
    normalizeRole,
}
