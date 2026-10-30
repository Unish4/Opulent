export const optimizeImage = (
  url: string | null,
  width: number,
): string | null => {
  if (!url) return null;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/"))
    return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};
