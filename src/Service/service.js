import axios from "axios";
import { USER_DETAILS } from "@/Constant/Constant";
import { removeLocalStorageItem } from "@/Utils/localStorage";

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
    (config) => config,
    (error) => Promise.reject(error),
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        removeLocalStorageItem(USER_DETAILS);
        if (typeof window !== "undefined") {
          window.location.replace("/");
        }
      }
      return Promise.reject(error);
    },
  );

  return api;
};

const apiMultipart = createApiForClient("multipart");
const apiJson = createApiForClient("json");

export { apiJson, apiMultipart };
