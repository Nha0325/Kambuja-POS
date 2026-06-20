import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";
export async function listSettings() { return unwrap(await api.get(endpoints.settings)); }
export async function saveSetting(payload) { return unwrap(await api.put(endpoints.settings, payload)); }
export async function getTelegramSetting() { return unwrap(await api.get(`${endpoints.telegram}/settings`)); }
export async function saveTelegramSetting(payload) { return unwrap(await api.put(`${endpoints.telegram}/settings`, payload)); }
