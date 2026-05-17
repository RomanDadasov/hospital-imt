import api from "../utils/axios";

export const getDashboardStats = () => api.get("/dashboard/stats");
export const getDoctorDashboardStats = () => api.get("/dashboard/doctor-stats");