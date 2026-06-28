import { api } from "../../utils/config/api"

export const cashierService = {
  scan: (code) => api.get(`/product-codes/lookup/${encodeURIComponent(code)}`),
  createSale: (payload) => api.post("/sales", payload),
  todaySales: () => api.get("/sales/today"),
  getAllSales: (params) => api.get("/sales", { params }),
  getProducts: (params) => api.get("/products", { params }),
}
