import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";
export async function getDashboard() { return unwrap(await api.get(`${endpoints.reports}/dashboard`)); }
export async function getSalesReport(params) { return unwrap(await api.get(`${endpoints.reports}/sales`, { params })); }
export async function getStockReport() { return unwrap(await api.get(endpoints.inventory)); }
