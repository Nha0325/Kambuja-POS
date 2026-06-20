import { api, unwrap } from "../../../services/api";
import { endpoints } from "../../../services/endpoints";
export async function listCustomers() { return unwrap(await api.get(endpoints.customers)); }
