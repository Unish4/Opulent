export const SITE = {
  name: "Opulent",
  whatsappNumber: String(import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(
    /\D/g,
    "",
  ),
  supportEmail:
    String(import.meta.env.VITE_SUPPORT_EMAIL ?? "") ||
    "contact@opulents.com",
  operatorName: String(import.meta.env.VITE_OPERATOR_NAME ?? ""),
  legalUpdated: "1 November 2026",
  social: {
    facebook:
      String(import.meta.env.VITE_FACEBOOK_URL ?? "") ||
      "https://www.facebook.com/opulentstation?rdid=bf3aQ6EXVv5NDv7d&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18ygVt54Vh%2F#",
    instagram:
      String(import.meta.env.VITE_INSTAGRAM_URL ?? "") ||
      "https://www.instagram.com/opulent_station?vrfl=MTkza2IwaGVpcGMwbw%3D%3D",
    discord: String(import.meta.env.VITE_DISCORD_URL ?? ""),
  },
};
