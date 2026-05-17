import api from "../utils/axios";

export const processPayment = (dto) => api.post("/payments", dto);
export const getPaymentByAppointment = (appointmentId) => api.get(`/payments/appointment/${appointmentId}`);
export const getAllPayments = () => api.get("/payments");
export const sendPaymentReminder = (appointmentId) => api.post(`/payments/${appointmentId}/reminder`);
export const downloadReceipt = (appointmentId) =>
  api.get(`/payments/appointment/${appointmentId}/receipt`, { responseType: "blob" });