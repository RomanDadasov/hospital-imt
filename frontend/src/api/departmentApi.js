import api from "../utils/axios";

export const getDepartments = () => api.get("/departments");
export const getDepartmentById = (id) => api.get(`/departments/${id}`);
export const createDepartment = (data) => api.post("/departments", data);
export const updateDepartment = (id, data) => api.put(`/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`);
export const uploadDepartmentImage = (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/departments/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};