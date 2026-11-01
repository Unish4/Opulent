import { MessageCircle } from "lucide-react";
import { Card } from "../components/ui";
import { buildWhatsAppLink } from "../utils/whatsapp";

const STEPS = [
  "Choose your game and package, and enter your player details exactly as shown in the game.",
  "Create the order. You get an order ID and the exact amount to pay.",
  "Pay with eSewa using the QR code. Enter the exact amount.",
  "Send your order ID and payment screenshot on WhatsApp.",
  "Our team checks your payment by hand, then tops up your account.",
];

const STATUSES = [
  {
    name: "Waiting for payment",
    text: "Your order exists but we have not seen a payment yet.",
  },
  {
    name: "Under review",
    text: "You told us you sent your proof. Our team is checking the payment.",
  },
  {
    name: "Processing",
    text: "Your payment is confirmed and we are topping up your account.",
  },
  {
    name: "On hold",
    text: "Something needs sorting out. We will contact you on WhatsApp.",
  },
  { name: "Completed", text: "Your top-up was delivered." },
  {
    name: "Failed",
    text: "We could not complete the top-up. We will contact you about a retry or refund.",
  },
  {
    name: "Rejected",
    text: "We could not match a valid payment to your order.",
  },
  {
    name: "Cancelled",
    text: "The order is cancelled. Unpaid orders are cancelled automatically after a while.",
  },
];

const FAQS = [
  {
    q: "I paid but my order still says waiting for payment.",
    a: "Send your order ID and payment screenshot on WhatsApp, then press the button on your order page. Our team checks payments by hand, so it is not instant.",
  },
  {
    q: "I entered the wrong player ID.",
    a: "Message us on WhatsApp straight away with your order ID. If the top-up has not been delivered yet we can correct it. Delivered top-ups cannot be recalled, so check your ID before paying.",
  },
  {
    q: "I paid the wrong amount.",
    a: "Tell us on WhatsApp. If you paid too little we will ask for the rest or refund you. If you paid too much, the extra is refunded.",
  },
  {
    q: "Can I get a refund?",
    a: "Refunds are reviewed case by case and are not automatic. You can request one from your order page when it applies. If approved, the money goes back to the eSewa account that paid. We do not promise a fixed time.",
  },
  {
    q: "Do you ever ask for my password?",
    a: "Not for Free Fire, PUBG Mobile or Mobile Legends. A few games, currently Roblox and eFootball, can only be topped up by signing in to your account, so those order forms ask for your login details. We store them encrypted, use them only for your order and delete them when it is finished. Only enter your password on the order form, never in a WhatsApp message, and change it after your top-up.",
  },
];

export default function HelpPage() {
  const whatsappLink = buildWhatsAppLink("Hello Opulent, I need help.");

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Help</h1>
        <p className="mt-2 text-secondary">
          How ordering works, what each status means, and what to do if
          something goes wrong.
        </p>
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-md bg-success/15 px-4 text-sm font-semibold text-success hover:bg-success/25"
          >
            <MessageCircle size={18} /> Chat with us on WhatsApp
          </a>
        )}
      </div>

      <section aria-labelledby="how">
        <h2 id="how" className="mb-3 font-display text-xl font-bold">
          How ordering works
        </h2>
        <ol className="space-y-2">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className="flex gap-3 rounded-lg border border-line bg-surface p-4 text-sm"
            >
              <span className="font-mono text-primary-hover">{index + 1}</span>
              <span className="text-secondary">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="statuses">
        <h2 id="statuses" className="mb-3 font-display text-xl font-bold">
          Order statuses
        </h2>
        <Card className="divide-y divide-line">
          {STATUSES.map((status) => (
            <div
              key={status.name}
              className="flex flex-col gap-1 p-4 text-sm sm:flex-row sm:gap-4"
            >
              <span className="w-44 shrink-0 font-semibold">{status.name}</span>
              <span className="text-secondary">{status.text}</span>
            </div>
          ))}
        </Card>
      </section>

      <section aria-labelledby="faq">
        <h2 id="faq" className="mb-3 font-display text-xl font-bold">
          Common problems
        </h2>
        <div className="space-y-2">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="rounded-lg border border-line bg-surface p-4"
            >
              <summary className="cursor-pointer font-medium">{item.q}</summary>
              <p className="mt-2 text-sm text-secondary">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
