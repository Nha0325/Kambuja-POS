import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function createSale(payload) {
  return unwrap(await api.post(endpoints.sales, payload));
}
export async function listSales() {
  return unwrap(await api.get(endpoints.sales));
}
export async function paySale(payload) {
  return unwrap(await api.post(endpoints.payments, payload));
}
