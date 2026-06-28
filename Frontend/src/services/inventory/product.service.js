import { api } from "../../utils/config/api"

export const productService = {
  list: (params) => api.get("/products", { params }),
  findByCode: (code) => api.get(`/products/code/${encodeURIComponent(code)}`),
}
