import { api } from "../configs/api"

export const notificationService = {
  channels: () => api.get("/notifications/channels"),
  saveChannel: (payload) => api.post("/notifications/channels", payload),
  logs: () => api.get("/notifications/logs"),
}
