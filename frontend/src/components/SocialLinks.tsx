import type { ReactNode } from "react";
import { SITE } from "../config/site";

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const ICONS: Record<string, ReactNode> = {
  facebook: (
    <svg {...svgProps}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  instagram: (
    <svg {...svgProps}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
};

const NETWORKS = [
  { key: "facebook", label: "Facebook", url: SITE.social.facebook },
  { key: "instagram", label: "Instagram", url: SITE.social.instagram },
];

export default function SocialLinks() {
  const items = NETWORKS.filter((item) => item.url.startsWith("https://"));
  if (items.length === 0) return null;

  return (
    <ul className="flex items-center gap-2" aria-label="Social media">
      {items.map((item) => (
        <li key={item.key}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className="flex size-9 items-center justify-center rounded-full border border-line text-secondary transition-colors hover:border-primary hover:text-fg"
          >
            {ICONS[item.key]}
          </a>
        </li>
      ))}
    </ul>
  );
}
