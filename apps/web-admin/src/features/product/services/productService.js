import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function listProducts(params = {}) {
  return unwrap(await api.get(endpoints.products, { params }));
}
export async function createProduct(payload) {
  return unwrap(await api.post(endpoints.products, payload));
}
export async function createProductCode(payload) {
  return unwrap(await api.post(endpoints.productCodes, payload));
}
export async function lookupProduct(code) {
  return unwrap(await api.get(`${endpoints.productCodes}/lookup/${encodeURIComponent(code)}`));
}
