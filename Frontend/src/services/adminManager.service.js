import { api } from "../configs/api"

const root = "/admin-manager"

export const adminManagerService = {
  dashboard: () => api.get(`${root}/dashboard`),
  shops: () => api.get(`${root}/shops`),
  shop: (id) => api.get(`${root}/shops/${id}`),
  createShop: (payload) => api.post(`${root}/shops`, payload),
  updateShop: (id, payload) => api.patch(`${root}/shops/${id}`, payload),
  updateShopStatus: (id, status) => api.patch(`${root}/shops/${id}/status`, { status }),
  deleteShop: (id) => api.delete(`${root}/shops/${id}`),
  admins: (params) => api.get(`${root}/admins`, { params }),
  availableAdmins: () => api.get(`${root}/admins?available=true`),
  createAdmin: (payload) => api.post(`${root}/admins`, payload),
  updateAdminStatus: (id, status) => api.patch(`${root}/admins/${id}/status`, { status }),
  reports: () => api.get(`${root}/reports`),
  auditLogs: () => api.get(`${root}/audit-logs`),
}
