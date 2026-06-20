import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function listSettings() {
  return unwrap(await api.get(endpoints.settings));
}

export async function saveSetting(payload) {
  return unwrap(await api.post(endpoints.settings, payload));
}
