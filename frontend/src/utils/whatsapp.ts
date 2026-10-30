import { SITE } from "../config/site";

export const buildWhatsAppLink = (message?: string): string | null => {
  if (!SITE.whatsappNumber) return null;
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
