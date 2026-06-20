import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";
export async function listNotifications() { return unwrap(await api.get(endpoints.notifications)); }
export async function markNotificationRead(id) { return unwrap(await api.patch(`${endpoints.notifications}/${id}/read`)); }
