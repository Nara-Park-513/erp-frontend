import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8888",
  timeout: 5000,
  // JWT Bearer 방식이면 보통 필요 없음
  // withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
