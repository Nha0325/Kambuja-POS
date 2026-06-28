export const ROLES = Object.freeze({
  ADMIN_MANAGER: "ADMIN_MANAGER",
  ADMIN: "ADMIN",
  CASHIER: "CASHIER",
})

const aliases = {
  super: ROLES.ADMIN_MANAGER,
  admin_manager: ROLES.ADMIN_MANAGER,
  manager: ROLES.ADMIN_MANAGER,
  admin: ROLES.ADMIN,
  cashier: ROLES.CASHIER,
}

export const normalizeRole = (role) => {
  if (!role) return role
  const value = String(role).trim()
  return aliases[value.toLowerCase()] || value.toUpperCase()
}

export const homeForRole = (role) => {
  switch (normalizeRole(role)) {
    case ROLES.ADMIN_MANAGER:
      return "/admin-manager/dashboard"
    case ROLES.ADMIN:
      return "/admin/dashboard"
    case ROLES.CASHIER:
      return "/cashier/pos"
    default:
      return "/unauthorized"
  }
}
