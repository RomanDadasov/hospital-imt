import api from "../utils/axios";

export const getAuditLogs = (params) => api.get("/audit", { params });