export interface BannerSlide {
  src: string;
  alt: string;
  to?: string;
}

export const BANNERS: BannerSlide[] = [
  {
    src: "/banners/banner-1.png",
    alt: "Free Fire diamonds in NPR",
    to: "/games/free-fire",
  },
  {
    src: "/banners/banner-2.png",
    alt: "PUBG Mobile UC top-up",
    to: "/games/pubg-mobile",
  },
  {
    src: "/banners/banner-3.png",
    alt: "Mobile Legends diamonds",
    to: "/games/mobile-legends",
  },
];
