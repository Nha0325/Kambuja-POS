import { api } from "../../utils/config/api"

export const userService = {
  list: (params) => api.get("/users", { params }),
  find: (id) => api.get(`/users/${id}`),
  create: (payload) => api.post("/users", payload),
  update: (id, payload) => api.patch(`/users/${id}`, payload),
  remove: (id) => api.delete(`/users/${id}`)
}
