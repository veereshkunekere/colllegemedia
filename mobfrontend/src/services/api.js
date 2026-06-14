import dotenv from "dotenv"
dotenv.config();
import axios from "axios";

import {
  getToken,
} from "../utils/storage";

const API = axios.create({
  baseURL: process.env.NODE_ENV == "development" ? "https://localhost:3000" : "https://colllegemedia.onrender.com/api",

  headers: {
    "Content-Type":
      "application/json",
  },
});
console.log("BASE URL:", API.defaults.baseURL);
API.interceptors.request.use(
  async (config) => {
    const token =
      await getToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export default API;