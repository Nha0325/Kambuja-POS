import axios from "axios";
import { appConfig } from "../app/config";

const AUTH_KEY = "kambuja-pos-web-admin-auth";

export const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem(AUTH_KEY) ?? "null");
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) localStorage.removeItem(AUTH_KEY);
    return Promise.reject(error);
  },
);

export function unwrap(response) {
  return response.data.data;
}
