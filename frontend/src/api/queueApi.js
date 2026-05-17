import api from "../utils/axios";

export const getTodayQueue = () => api.get("/queue/today");
export const addToQueue = (appointmentId) => api.post(`/queue/${appointmentId}/enqueue`);
export const callNext = (appointmentId) => api.post(`/queue/${appointmentId}/call`);
export const completeAppointment = (appointmentId) => api.post(`/queue/${appointmentId}/complete`);