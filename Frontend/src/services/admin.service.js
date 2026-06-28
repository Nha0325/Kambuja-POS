import { api } from "../configs/api"

export const adminService = {
  shop: () => api.get("/shops/me"),
  updateShop: (payload) => api.patch("/shops/me", payload),
  inventory: () => api.get("/inventory/overview"),
  inventoryMovements: () => api.get("/inventory/movements"),
  receiveStock: (payload) => api.post("/stock/receive", payload),
  stockIn: (payload) => api.post("/inventory/stock-in", payload),
  adjustStock: (payload) => api.post("/inventory/adjustment", payload),
}
