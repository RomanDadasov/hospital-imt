import api from "../utils/axios";
export const globalSearch = (q) => api.get(`/search?q=${encodeURIComponent(q)}`);