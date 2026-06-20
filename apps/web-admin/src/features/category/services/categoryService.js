import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function listCategories() {
  return unwrap(await api.get(endpoints.categories));
}
export async function createCategory(payload) {
  return unwrap(await api.post(endpoints.categories, payload));
}
