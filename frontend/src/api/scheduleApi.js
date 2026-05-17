import api from "../utils/axios";

export const getDoctorSchedule = (doctorId) => api.get(`/doctorschedule/doctor/${doctorId}`);
export const getDoctorWeeklySchedule = (doctorId, weekStart) =>
  api.get(`/doctorschedule/doctor/${doctorId}/weekly`, { params: { weekStart } });
export const getAllDoctorsSchedule = (weekStart) =>
  api.get(`/doctorschedule/all/weekly`, { params: { weekStart } });
export const createSchedule = (data) => api.post("/doctorschedule", data);
export const updateSchedule = (id, data) => api.put(`/doctorschedule/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/doctorschedule/${id}`);