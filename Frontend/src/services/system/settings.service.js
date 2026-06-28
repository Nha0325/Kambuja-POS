import { api } from "../../utils/config/api"

export const settingsService = {
  get: () => api.get("/settings"),
  update: (payload) => api.patch("/settings", payload)
}
