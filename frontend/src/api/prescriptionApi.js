import api from "../utils/axios";

export const createPrescription = (data) => api.post("/prescriptions", data);
export const getPrescriptionsByAppointment = (appointmentId) => api.get(`/prescriptions/appointment/${appointmentId}`);
export const getPrescriptionsByPatient = (patientId) => api.get(`/prescriptions/patient/${patientId}`);
export const getPrescriptionByQr = (qrCode) => api.get(`/prescriptions/qr/${qrCode}`);
export const dispensePrescription = (qrCode) => api.post(`/prescriptions/dispense/${qrCode}`);
export const downloadPrescriptionPdf = (id) => api.get(`/prescriptions/${id}/pdf`, { responseType: "blob" });