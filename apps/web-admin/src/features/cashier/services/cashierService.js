import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function listCashiers() {
  return unwrap(await api.get(endpoints.cashiers));
}
export async function createCashier(payload) {
  return unwrap(await api.post(endpoints.createCashier, payload));
}
