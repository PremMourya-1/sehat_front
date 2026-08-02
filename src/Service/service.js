import axios from "axios";
import { getCurrentApiToken } from "@/Service/sessionBridge";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

const createApiForClient = (contentType) => {
  const headers = { "Cache-Control": "no-cache" };
  if (contentType === "multipart") headers["Content-Type"] = "multipart/form-data";
  else if (contentType === "json") headers["Content-Type"] = "application/json";

  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    withCredentials: true,
    headers,
  });

  api.interceptors.request.use(
    (config) => {
      const apiToken = getCurrentApiToken();
      if (apiToken) {
        config.headers.Authorization = `Bearer ${apiToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && typeof window !== "undefined") {
        window.location.replace("/");
      }
      return Promise.reject(error);
    },
  );

  return api;
};

const apiMultipart = createApiForClient("multipart");
const apiJson = createApiForClient("json");

export { apiJson, apiMultipart };
