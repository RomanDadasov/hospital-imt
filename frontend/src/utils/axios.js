import axios from "axios";
import useTokenStore from "../stores/tokenStore";

const api = axios.create({
  baseURL: "http://localhost:5171/api",
  headers: { "Content-Type": "application/json" },
});

let refreshTimer = null;

const getTokenTtl = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    return exp - Date.now() - 60_000;
  } catch {
    return 0;
  }
};

export const scheduleRefresh = (accessToken) => {
  if (refreshTimer) clearTimeout(refreshTimer);
  const ttl = getTokenTtl(accessToken);
  if (ttl <= 0) {
    refreshTokens();
    return;
  }
  refreshTimer = setTimeout(() => {
    refreshTokens();
  }, ttl);
};

export const stopRefresh = () => {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = null;
};

export const refreshTokens = async () => {
  try {
    const refreshToken = useTokenStore.getState().refreshToken;
    if (!refreshToken) throw new Error("No refresh token");

    const { data } = await axios.post(
      "http://localhost:5171/api/auth/refresh",
      { refreshToken }
    );

    if (data.data.accessToken) {
      useTokenStore.getState().setTokens(
        data.data.accessToken,
        data.data.refreshToken
      );
      scheduleRefresh(data.data.accessToken);
      return data.data.accessToken;
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    stopRefresh();
    useTokenStore.getState().clearTokens();
    window.location.href = "/login";
    return null;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = useTokenStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const newToken = await refreshTokens();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);

export default api;