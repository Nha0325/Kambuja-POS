import api from "../configs/api"

const root = "/admin-manager"

export const adminManagerService = {
  getDashboard: () => api.get(`${root}/dashboard`),
  getShops: (params) => api.get(`${root}/shops`, { params }),
  getShopById: (id) => api.get(`${root}/shops/${id}`),
  createShop: (payload) => api.post(`${root}/shops`, payload),
  updateShop: (id, payload) => api.patch(`${root}/shops/${id}`, payload),
  archiveShop: (id) => api.patch(`${root}/shops/${id}/archive`),
  restoreShop: (id) => api.patch(`${root}/shops/${id}/restore`),
  getAdmins: (params) => api.get(`${root}/admins`, { params }),
  getAdmin: (id) => api.get(`${root}/admins/${id}`),
  createAdmin: (payload) => api.post(`${root}/admins`, payload),
  updateAdmin: (id, payload) => api.patch(`${root}/admins/${id}`, payload),
  getReports: (params) => api.get(`${root}/reports`, { params }),
  getSystemHealth: () => api.get(`${root}/system-health`),
  getSubscriptions: (params) => api.get(`${root}/subscriptions`, { params }),
  getNotifications: (params) => api.get(`${root}/notifications`, { params }),
  getUnreadNotificationsCount: () => api.get(`${root}/notifications/unread-count`),
  markNotificationAsRead: (id) => api.patch(`${root}/notifications/${id}/read`),
  markAllNotificationsAsRead: () => api.patch(`${root}/notifications/read-all`),
  alerts: (params) => api.get(`/alerts`, { params }),
  markAlertAsRead: (id) => api.patch(`/alerts/${id}/read`),
  markAllAlertsAsRead: () => api.patch(`/alerts/read-all`),
  resolveAlert: (id) => api.patch(`/alerts/${id}/resolve`),
  
  // Retaining existing methods that might be used by other parts
  updateShopStatus: (id, status) => api.patch(`${root}/shops/${id}/status`, { status }),
  deleteShop: (id) => api.delete(`${root}/shops/${id}`),
  availableAdmins: () => api.get(`${root}/admins?available=true`),
  updateAdminStatus: (id, status) => api.patch(`${root}/admins/${id}/status`, { status }),
  auditLogs: () => api.get(`${root}/audit-logs`),
  backups: () => api.get(`${root}/backups`),
  createBackup: () => api.post(`${root}/backups`),
  deleteBackup: (id) => api.delete(`${root}/backups/${id}`),
}
