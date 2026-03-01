import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8888",
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  // ✅ 너 프로젝트에서 실제로 쓰는 키로 맞추기(일단 후보를 다 체크)
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ 확인 로그 (한번만 보고 싶으면 필요할 때만 켜)
  // console.log("REQ", config.method, config.url, "AUTH?", !!token);

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // ✅ 403 원인 힌트가 서버에서 내려오는 경우 많음
    // console.log("ERR", err?.response?.status, err?.response?.data);
    return Promise.reject(err);
  }
);

export default api;