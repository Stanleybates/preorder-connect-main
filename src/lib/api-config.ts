const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8001/api/auth";

export { API_BASE_URL };
