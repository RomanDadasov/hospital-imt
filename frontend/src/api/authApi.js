import api from "../utils/axios";

export const login = (data) => api.post("/auth/login", data);
export const refresh = (data) => api.post("/auth/refresh", data);
export const revoke = (data) => api.post("/auth/revoke", data);
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);
export const resetPassword = (data) => api.post("/auth/reset-password", data);
export const verifyTwoFactor = (data) => api.post("/auth/verify-2fa", data);
export const resendTwoFactor = (data) => api.post("/auth/resend-2fa", data);