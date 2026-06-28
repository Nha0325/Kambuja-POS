import { api } from "../../utils/config/api"

export const purchaseService = {
  list: (params) => api.get("/purchases", { params }),
  find: (id) => api.get(`/purchases/${id}`),
  create: (payload) => api.post("/purchases", payload),
  update: (id, payload) => api.patch(`/purchases/${id}`, payload),
  remove: (id) => api.delete(`/purchases/${id}`)
}
