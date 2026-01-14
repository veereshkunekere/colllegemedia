import axios from 'axios';

const BASE = import.meta.env.VITE_ENV_MODE === "development" ? "http://localhost:3000/api" : "https://colllegemedia.onrender.com/api"
console.log("API BASE URL:", BASE);
const api = axios.create({
  baseURL: BASE,
  // baseURL:"https://colllegemedia.onrender.com/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const BASE_URL = BASE;
export default api;
