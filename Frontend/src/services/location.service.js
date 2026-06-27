import api from "../configs/api"

export const locationService = {
  getSummary: () => api.get("/locations/summary"),
  getAll: () => api.get("/locations"),
  create: (payload) => api.post("/locations", payload),
  update: (id, payload) => api.put(`/locations/${id}`, payload),
  remove: (id) => api.delete(`/locations/${id}`),
}
