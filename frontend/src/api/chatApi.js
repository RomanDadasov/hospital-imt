import api from "../utils/axios";

export const getChatHistory = (roomId) =>
  api.get(`/chat/${roomId}/history`);

export const uploadChatFile = (formData) =>
  api.post("/chat/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const clearChatHistory = (roomId) => api.delete(`/chat/history/${roomId}`);