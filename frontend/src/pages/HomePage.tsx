import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { CreditCard, MessageCircle, ShieldCheck } from "lucide-react";
import GameCard from "../components/game/GameCard";
import GameCardSkeleton from "../components/game/GameCardSkeleton";
import SearchInput from "../components/SearchInput";
import ErrorState from "../components/ErrorState";
import { useGames } from "../hooks/useGames";
import { buildWhatsAppLink } from "../utils/whatsapp";

const TRUST_POINTS = [
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

const STEPS = [
  {
    title: "Choose your game",
    text: "Pick the game and the package you want.",
  },
  {
    title: "Enter your player details",
    text: "Add your player ID exactly as shown in the game.",
  },
  {
    title: "Pay with eSewa",
    text: "You get an order ID and a QR code with the exact amount.",
  },
  {
    title: "Send proof on WhatsApp",
    text: "Send your order ID and payment screenshot to us.",
  },
  {
    title: "We verify and top up",
    text: "Our team checks the payment, then tops up your account.",
  },
];

const FAQS = [
  {
    q: "Do you need my password?",
    a: "Never. We only need your player ID (and server ID where the game uses one). Do not share your password or login codes with anyone.",
  },
  {
    q: "How long does a top-up take?",
    a: "Every order is checked and processed by a person, so we do not promise a fixed time. Message us on WhatsApp if you are waiting.",
  },
  {
    q: "What if I entered the wrong ID?",
    a: "Check your ID carefully before paying. If you notice a mistake, contact us on WhatsApp straight away.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, error, refetch } = useGames({
    featured: true,
    limit: 8,
  });
  const whatsappLink = buildWhatsAppLink("Hello Opulent, I have a question.");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    navigate(term ? `/games?search=${encodeURIComponent(term)}` : "/games");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="py-12 sm:py-20">
        <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Game top-ups for Nepal,{" "}
          <span className="text-primary-hover">in NPR.</span>
        </h1>
        <p className="mt-4 max-w-xl text-white text-secondary sm:text-lg">
          Free Fire, PUBG Mobile and Mobile Legends. Pay with eSewa and get
          support on WhatsApp.
        </p>
        <form onSubmit={onSearch} className="mt-8 flex max-w-xl gap-2">
          <SearchInput
            className="flex-1"
            value={query}
            onChange={setQuery}
            placeholder="Search for a game..."
          />
          <button
            type="submit"
            className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Search
          </button>
        </form>
      </section>

      <section aria-labelledby="popular-games" className="pb-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="popular-games" className="font-display text-xl font-bold">
            Popular games
          </h2>
          <Link
            to="/games"
            className="text-sm font-medium text-primary-hover hover:underline"
          >
            View all
          </Link>
        </div>

        {isError ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }, (_, i) => (
                  <GameCardSkeleton key={i} />
                ))
              : data?.games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 pb-12 sm:grid-cols-3">
        {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-lg border border-line bg-surface p-5"
          >
            <Icon className="text-primary-hover" size={22} />
            <h2 className="mt-3 font-display text-white font-semibold">
              {title}
            </h2>
            <p className="mt-1 text-sm text-secondary">{text}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="how-to-buy" className="pb-12">
        <h2 id="how-to-buy" className="mb-4 font-display text-xl font-bold">
          How to buy
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-lg border border-line bg-surface p-4"
            >
              <span className="font-mono text-sm text-primary-hover">
                {index + 1}
              </span>
              <h3 className="mt-1 font-display text-sm font-semibold">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-secondary">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq" className="pb-16">
        <h2 id="faq" className="mb-4 font-display text-xl font-bold">
          Frequently asked questions
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
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-success/15 px-4 py-2 text-sm font-semibold text-success hover:bg-success/25"
          >
            <MessageCircle size={16} /> Chat with us on WhatsApp
          </a>
        )}
      </section>
    </div>
  );
}
