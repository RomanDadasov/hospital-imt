import api from "../utils/axios";

export const uploadAttachment = (appointmentId, formData) =>
  api.post(`/appointments/${appointmentId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const downloadAttachment = (appointmentId, attachmentId) =>
  api.get(`/appointments/${appointmentId}/attachments/${attachmentId}`, {
    responseType: "blob",
  });

export const deleteAttachment = (appointmentId, attachmentId) =>
  api.delete(`/appointments/${appointmentId}/attachments/${attachmentId}`);