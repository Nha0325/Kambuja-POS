import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function getDashboard() {
  return unwrap(await api.get(endpoints.dashboard));
}
