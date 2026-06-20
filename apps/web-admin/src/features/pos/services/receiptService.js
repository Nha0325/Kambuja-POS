import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function generateReceipt(saleId) {
  return unwrap(await api.post(`${endpoints.receipts}/sale/${saleId}`));
}
export async function getReceipt(saleId) {
  return unwrap(await api.get(`${endpoints.receipts}/sale/${saleId}`));
}
