import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function listInventory() {
  return unwrap(await api.get(endpoints.inventory));
}
export async function saveInventory(payload) {
  return unwrap(await api.put(endpoints.inventory, payload));
}
export async function listStockMovements() {
  return unwrap(await api.get(endpoints.stockMovements));
}
export async function createStockMovement(payload) {
  return unwrap(await api.post(endpoints.stockMovements, payload));
}
