import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { buildWhatsAppLink } from "../utils/whatsapp";

const KEY = "opulent:wa-bubble-dismissed";

function wasDismissed(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function rememberDismissed(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // Storage unavailable: the bubble simply shows again next visit.
  }
}

export default function WhatsAppFloat() {
  const link = buildWhatsAppLink("Hello Opulent, I need help.");
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (wasDismissed()) return;
    const timer = setTimeout(() => setShowBubble(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!link) return null;

  const dismiss = () => {
    setShowBubble(false);
    rememberDismissed();
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {showBubble && (
        <div
          role="status"
          className="relative max-w-60 rounded-lg bg-white py-3 pl-4 pr-9 text-sm font-semibold text-[#0a0d14] shadow-xl"
        >
          How may we help you today?
          <button
            type="button"
            aria-label="Dismiss"
            onClick={dismiss}
            className="absolute right-2 top-2 rounded-full p-1 text-[#0a0d14]/60 hover:bg-black/5"
          >
            <X size={14} />
          </button>
          <span className="absolute -bottom-1 right-6 size-3 rotate-45 bg-white" />
        </div>
      )}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform hover:scale-105"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
