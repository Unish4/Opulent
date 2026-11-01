import { Link } from "react-router";
import { SITE } from "../config/site";
import Logo from "./Logo";

const InstagramIcon = () => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4 shrink-0"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4 shrink-0"
    aria-hidden="true"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const DiscordIcon = () => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-4 shrink-0"
    aria-hidden="true"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4 shrink-0"
    aria-hidden="true"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappUrl = SITE.whatsappNumber
    ? `https://wa.me/${SITE.whatsappNumber}`
    : "";

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-3">
            <Link to="/" className="inline-block">
              <Logo className="h-9" />
            </Link>
            <p className="text-sm leading-relaxed text-secondary">
              Nepal's fast and reliable top-up marketplace for games.
            </p>
          </div>

          {/* Column 2: Social Media */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-fg">
              SOCIAL MEDIA
            </h3>
            <ul className="mt-4 space-y-3">
              {SITE.social.instagram && (
                <li>
                  <a
                    href={SITE.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-secondary transition-colors hover:text-fg"
                  >
                    <InstagramIcon />
                    <span>Instagram</span>
                  </a>
                </li>
              )}
              {SITE.social.facebook && (
                <li>
                  <a
                    href={SITE.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-secondary transition-colors hover:text-fg"
                  >
                    <FacebookIcon />
                    <span>Facebook</span>
                  </a>
                </li>
              )}
              {SITE.social.discord && (
                <li>
                  <a
                    href={SITE.social.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-amber transition-colors hover:text-amber-300"
                  >
                    <DiscordIcon />
                    <span>Discord</span>
                  </a>
                </li>
              )}
              {whatsappUrl && (
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-secondary transition-colors hover:text-fg"
                  >
                    <WhatsAppIcon />
                    <span>WhatsApp</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-fg">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-secondary transition-colors hover:text-fg"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-sm text-secondary transition-colors hover:text-fg"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-sm text-secondary transition-colors hover:text-fg"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-fg">
              Support
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/help"
                  className="text-sm text-secondary transition-colors hover:text-fg"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/account/orders"
                  className="text-sm text-secondary transition-colors hover:text-fg"
                >
                  Track Order
                </Link>
              </li>
              
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line/80 pt-6 text-xs text-muted sm:flex-row">
          <span>© {currentYear} Opulent Station. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
