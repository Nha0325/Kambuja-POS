import api from "../configs/api"

export const categoryService = {
  list: (params) => api.get("/categories", { params }),
  find: (id) => api.get(`/categories/${id}`),
  create: (payload) => api.post("/categories", payload),
  update: (id, payload) => api.patch(`/categories/${id}`, payload),
  remove: (id) => api.delete(`/categories/${id}`)
}
