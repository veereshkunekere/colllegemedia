import axios from 'axios';

// Dev: include /api in base so dev calls can use endpoints without /api prefix
const BASE = import.meta.env.DEV ? 'http://localhost:3000/api' : 'http://localhost:3000/api';
const api = axios.create({
    
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In production the base is '/', ensure requests are routed to /api on the same origin
// api.interceptors.request.use((config) => {
//   if ((api.defaults.baseURL === '/' || api.defaults.baseURL === '') && config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
//     config.url = '/api' + (config.url.startsWith('/') ? config.url : '/' + config.url);
//   }
//   return config;
// });

export const BASE_URL = BASE;
export default api;
