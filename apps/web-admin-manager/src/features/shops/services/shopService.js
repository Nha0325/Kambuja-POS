import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function listShops() {
  return unwrap(await api.get(endpoints.shops));
}
