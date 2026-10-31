import { SITE } from "../config/site";

export const buildWhatsAppLink = (
  message?: string,
  number: string = SITE.whatsappNumber,
): string | null => {
  if (!number) return null;
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
