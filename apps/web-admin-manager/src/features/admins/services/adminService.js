import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function listAdmins() {
  return unwrap(await api.get(endpoints.admins));
}

export async function createAdmin(payload) {
  return unwrap(await api.post(endpoints.admins, payload));
}
