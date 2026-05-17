import { create } from "zustand";
import { getRoleFromToken } from "../utils/utils";

const loadFromStorage = () => {
  try {
    const local = localStorage.getItem("hospital-auth");
    const session = sessionStorage.getItem("hospital-auth");
    if (local) return JSON.parse(local);
    if (session) return JSON.parse(session);
  } catch { }
  return null;
};

const saved = loadFromStorage();

const useTokenStore = create((set) => ({
  accessToken: saved?.accessToken || null,
  refreshToken: saved?.refreshToken || null,
  role: saved?.role || null,
  user: saved?.user || null,

  setTokens: (accessToken, refreshToken, rememberMe = false) => {
    const role = getRoleFromToken(accessToken);
    const data = JSON.stringify({ accessToken, refreshToken, role });
    if (rememberMe) {
      localStorage.setItem("hospital-auth", data);
      sessionStorage.removeItem("hospital-auth");
    } else {
      sessionStorage.setItem("hospital-auth", data);
      localStorage.removeItem("hospital-auth");
    }
    set({ accessToken, refreshToken, role });
  },

  setUser: (user) => {
    const local = localStorage.getItem("hospital-auth");
    const session = sessionStorage.getItem("hospital-auth");
    if (local) {
      localStorage.setItem("hospital-auth", JSON.stringify({ ...JSON.parse(local), user }));
    } else if (session) {
      sessionStorage.setItem("hospital-auth", JSON.stringify({ ...JSON.parse(session), user }));
    }
    set({ user });
  },

  clearTokens: () => {
    localStorage.removeItem("hospital-auth");
    sessionStorage.removeItem("hospital-auth");
    set({ accessToken: null, refreshToken: null, role: null, user: null });
  },
}));

export default useTokenStore;