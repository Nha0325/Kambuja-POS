import { api } from "../configs/api"

export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  current: () => api.get("/auth/current"),
  logout: () => api.post("/auth/logout"),
}
