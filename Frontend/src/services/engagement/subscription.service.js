import { api } from "../../utils/config/api"

export const subscriptionService = {
  getSummary: () => api.get("/subscriptions/summary"),
  getAll: () => api.get("/subscriptions"),
  create: (payload) => api.post("/subscriptions", payload),
  update: (id, payload) => api.put(`/subscriptions/${id}`, payload),
  remove: (id) => api.delete(`/subscriptions/${id}`),
}
