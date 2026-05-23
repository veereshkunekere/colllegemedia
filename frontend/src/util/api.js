import axios from 'axios';

const BASE =
  import.meta.env.VITE_ENV_MODE === "development"
    ? "http://localhost:3000/api"
    : "https://colllegemedia.onrender.com/api";

console.log("API BASE URL:", BASE);

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const BASE_URL = BASE;
export default api;