import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function listShops() {
  return unwrap(await api.get(endpoints.shops));
}

export async function createShop(data) {
  return unwrap(await api.post(endpoints.shops, data));
}
