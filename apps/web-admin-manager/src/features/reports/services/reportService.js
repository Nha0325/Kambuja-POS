import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";

export async function getSalesReports(params) {
  return unwrap(await api.get(endpoints.salesReports, { params }));
}

export async function getStockReports(params) {
  return unwrap(await api.get(endpoints.stockReports, { params }));
}
