import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function getShop() {
  return unwrap(await api.get(endpoints.shop));
}

export async function updateShop(payload) {
  return unwrap(await api.put(endpoints.shop, payload));
}
