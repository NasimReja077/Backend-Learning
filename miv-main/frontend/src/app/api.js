import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // always send cookies
  timeout: 10000,
});

// Response interceptor – surface errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message;

    // Don't toast 401 on /auth/me (expected when logged out)
    const isAuthCheck = err.config?.url?.includes("/auth/me");
    if (!isAuthCheck && msg && err.response?.status !== 401) {
      toast.error(msg);
    }

    return Promise.reject(err);
  }
);

export default api;
