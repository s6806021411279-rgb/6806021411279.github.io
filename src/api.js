import axios from "axios";

// dev: ผ่าน proxy ของ Vite   |  production: ตั้ง VITE_API_URL=http://host:8000
export const API = import.meta.env.VITE_API_URL || "";
export const api = axios.create({ baseURL: API });
export const url = (u) => (u?.startsWith("http") ? u : API + u);
