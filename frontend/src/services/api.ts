import axios from "axios";

export interface ApiError extends Error {
  status?: number;
  code?: string;
  requestId?: string;
  details?: { path: string; message: string }[];
}

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (!envUrl) return "/api";
  let trimmed = envUrl.replace(/\/+$/, "");
  if (trimmed.endsWith("/api/v1")) {
    trimmed = trimmed.slice(0, -3);
  }
  if (trimmed.endsWith("/api")) {
    return trimmed;
  }
  return `${trimmed}/api`;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const body = error.response?.data?.error;
    const apiError: ApiError = Object.assign(
      new Error(body?.message ?? "Something went wrong. Please try again."),
      {
        status: error.response?.status,
        code: body?.code,
        requestId: body?.requestId,
        details: body?.details,
      },
    );
    return Promise.reject(apiError);
  },
);
