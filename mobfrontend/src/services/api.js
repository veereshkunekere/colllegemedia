import axios from "axios";

import {
  getToken,
} from "../utils/storage";

const API = axios.create({
   baseURL:
    process.env.EXPO_PUBLIC_ENV === "development"
      ? process.env.EXPO_PUBLIC_LOCAL_IP_URL
      : process.env.EXPO_PUBLIC_API_BASE_URL,

  headers: {
    "Content-Type":
      "application/json",
  },
});

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