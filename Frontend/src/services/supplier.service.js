import { api } from "../configs/api"

export const supplierService = {
  list: (params) => api.get("/suppliers", { params }),
  find: (id) => api.get(`/suppliers/${id}`),
  create: (payload) => api.post("/suppliers", payload),
  update: (id, payload) => api.patch(`/suppliers/${id}`, payload),
  remove: (id) => api.delete(`/suppliers/${id}`)
}
