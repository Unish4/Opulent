import { CreditCard, MessageCircle, ShieldCheck } from "lucide-react";

const POINTS = [
  {
    icon: CreditCard,
    title: "Pay in NPR",
    text: "Pay with eSewa. No international card needed.",
  },
  {
    icon: ShieldCheck,
    title: "Checked by a person",
    text: "Every payment is verified by our team before your top-up is made.",
  },
  {
    icon: MessageCircle,
    title: "Support on WhatsApp",
    text: "Talk to a real person about your order.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <section className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Game top-ups for Nepal,{" "}
          <span className="text-primary-hover">in NPR.</span>
        </h1>
        <p className="mt-4 text-base text-secondary sm:text-lg">
          Free Fire, PUBG Mobile and Mobile Legends. The game catalogue is being
          added.
        </p>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {POINTS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-lg border border-line bg-surface p-5"
          >
            <Icon className="text-primary-hover" size={22} />
            <h2 className="mt-3 font-display text-base font-semibold">
              {title}
            </h2>
            <p className="mt-1 text-sm text-secondary">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
