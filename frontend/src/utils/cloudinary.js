export const optimizeImage = (url, width = 400, height = 400) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`);
};