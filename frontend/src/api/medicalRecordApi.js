import api from "../utils/axios";

export const getMedicalRecords = (patientId) => api.get(`/medicalrecords/patient/${patientId}`);
export const createMedicalRecord = (data) => api.post("/medicalrecords", data);
export const updateMedicalRecord = (id, data) => api.put(`/medicalrecords/${id}`, data);
export const deleteMedicalRecord = (id) => api.delete(`/medicalrecords/${id}`);
export const downloadPatientHistoryPdf = (patientId) =>
  api.get(`/medicalrecords/patient/${patientId}/pdf`, { responseType: "blob" });