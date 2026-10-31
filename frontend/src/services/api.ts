import axios from "axios";

export interface ApiError extends Error {
  status?: number;
  code?: string;
  requestId?: string;
  details?: { path: string; message: string }[];
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api",
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
