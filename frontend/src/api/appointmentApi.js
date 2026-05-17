import api from "../utils/axios";

export const getAppointments = (params) => api.get("/appointments", { params });
export const getMyAppointments = (params) => api.get("/appointments/my", { params });
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);
export const createAppointment = (data) => api.post("/appointments", data);
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);
export const archiveAppointment = (id) => api.patch(`/appointments/archive/${id}`);
export const changeAppointmentStatus = (id, data) => api.patch(`/appointments/status/${id}`, data);
export const downloadAppointmentPdf = (id) =>
  api.get(`/appointments/${id}/download/pdf`, { responseType: "blob" });
export const downloadAppointmentDocx = (id) =>
  api.get(`/appointments/${id}/download/docx`, { responseType: "blob" });
export const getAppointmentStats = () => api.get("/appointments/stats");
