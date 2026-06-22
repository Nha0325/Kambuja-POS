import { api } from "../configs/api"

export const cashierService = {
  scan: (code) => api.get(`/product-codes/lookup/${encodeURIComponent(code)}`),
  createSale: (payload) => api.post("/sales", payload),
  todaySales: () => api.get("/sales/today"),
}
