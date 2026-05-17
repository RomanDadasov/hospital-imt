import api from "../utils/axios";

export const getPatients = (params) => api.get("/patients", { params });
export const getPatientById = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post("/patients", data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);
export const archivePatient = (id) => api.patch(`/patients/archive/${id}`);