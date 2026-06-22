import { api } from "../configs/api"

export const saleService = {
  list: (params) => api.get("/sales", { params }),
  find: (id) => api.get(`/sales/${id}`),
  create: (payload) => api.post("/sales", payload),
}
