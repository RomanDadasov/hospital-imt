import { jwtDecode } from "jwt-decode";

export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const getRoleFromToken = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  return (
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null
  );
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("az-AZ") +
    " " +
    d.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })
  );
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};