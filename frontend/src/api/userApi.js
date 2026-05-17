import api from "../utils/axios";

export const getProfile = () => api.get("/users/me");
export const updateProfile = (data) => api.put("/users/me", data);
export const changePassword = (data) => api.post("/users/change-password", data);
export const uploadProfileImage = (formData) =>
  api.post("/users/me/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });