import api from "../utils/axios";

export const getStaff = () => api.get("/staff");
export const createStaff = (data) => api.post("/staff", data);
export const deleteStaff = (id) => api.delete(`/staff/${id}`);
export const resetStaffPassword = (userId, newPassword) =>
  api.patch(`/staff/${userId}/reset-password`, { newPassword });