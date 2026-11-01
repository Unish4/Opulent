import { MessageCircle } from "lucide-react";
import { SITE } from "../config/site";
import { buildWhatsAppLink } from "../utils/whatsapp";

export interface LegalSection {
  heading: string;
  body: string[];
}

interface LegalPageProps {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalPage({ title, intro, sections }: LegalPageProps) {
  const whatsappLink = buildWhatsAppLink("Hello Opulent, I have a question.");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted">
        Last updated {SITE.legalUpdated}
      </p>
      <p className="mt-4 text-secondary">{intro}</p>

      <div className="mt-8 space-y-8">
        {sections.map((section, index) => (
          <section key={section.heading} aria-labelledby={`legal-${index}`}>
            <h2
              id={`legal-${index}`}
              className="font-display text-lg font-semibold"
            >
              {index + 1}. {section.heading}
            </h2>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-secondary">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-line bg-surface p-5 text-sm">
        <p className="font-semibold">Questions?</p>
        {SITE.supportEmail && (
          <p className="mt-1 text-secondary">Email: {SITE.supportEmail}</p>
        )}
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 font-semibold text-success hover:underline"
          >
            <MessageCircle size={16} /> Message us on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
