import { api } from "../configs/api"

export const reportService = {
  general: () => api.get("/report/general"),
  sales: (params) => api.get("/report/sale", { params }),
  stock: (params) => api.get("/report/stock", { params }),
}
