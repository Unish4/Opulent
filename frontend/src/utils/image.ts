interface OptimizeOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "limit" | "fit" | "scale";
  gravity?: "auto" | "center" | string;
  quality?: "auto" | "auto:best" | "auto:good" | number;
  dpr?: number | string;
}

export const optimizeImage = (
  url: string | null,
  width: number = 400,
  options?: OptimizeOptions,
): string | null => {
  if (!url) return null;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  // If already contains optimization parameters, don't double-transform (but ensure center gravity)
  if (url.includes("/upload/f_auto")) {
    return url.replace("g_auto", "g_center");
  }

  const targetW = options?.width ?? width;
  const crop = options?.crop ?? "fill";
  const targetH = options?.height ?? (crop === "fill" ? targetW : undefined);
  const gravity = options?.gravity ?? (crop === "fill" ? "center" : undefined);
  const quality = options?.quality ?? "auto:best";
  const dpr = options?.dpr ?? "2.0";

  const parts = ["f_auto", `q_${quality}`];
  if (targetW) parts.push(`w_${targetW}`);
  if (targetH) parts.push(`h_${targetH}`);
  if (crop) parts.push(`c_${crop}`);
  if (gravity) parts.push(`g_${gravity}`);
  if (dpr) parts.push(`dpr_${dpr}`);

  return url.replace("/upload/", `/upload/${parts.join(",")}/`);
};
