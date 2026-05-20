import axios from "axios";

import {
  getToken,
} from "../utils/storage";

const API = axios.create({
  baseURL:
    "http://192.168.31.184:3000/api",

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