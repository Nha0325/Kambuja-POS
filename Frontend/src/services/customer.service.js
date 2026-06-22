import { api } from "../configs/api"

export const customerService = {
  list: (params) => api.get("/customers", { params }),
  find: (id) => api.get(`/customers/${id}`),
  create: (payload) => api.post("/customers", payload),
  update: (id, payload) => api.patch(`/customers/${id}`, payload),
  remove: (id) => api.delete(`/customers/${id}`)
}
