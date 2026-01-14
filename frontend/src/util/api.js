import axios from 'axios';

const BASE = import.meta.env.VITE_ENV === "development" ? "http://localhost:3000/api" : "https://colllegemedia.onrender.com/api"
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  // baseURL:"https://colllegemedia.onrender.com/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const BASE_URL = BASE;
export default api;
