import axios from "axios";
import { apiUrl } from "./env";
export const api = axios.create({
    baseURL: `${apiUrl}`,
    withCredentials: true
})
