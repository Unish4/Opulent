export const SITE = {
  name: "Opulent",
  whatsappNumber: String(import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(
    /\D/g,
    "",
  ),
};
