import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function login(credentials) {
  return unwrap(await api.post(endpoints.login, credentials));
}
