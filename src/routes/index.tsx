import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ImageIcon, Link2, Mic, ShieldCheck, TrendingDown } from "lucide-react";
import { Card, DecisionPill, Screen, SectionTitle } from "@/components/truebuy/ui";
import { inr } from "@/lib/truebuy/engine";
import { useDecisions } from "@/lib/truebuy/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SureShop — AI-powered purchase decision engine" },
      {
        name: "description",
        content:
          "Don't ask AI what to buy. Ask AI whether you should buy. SureShop scores any purchase and recommends BUY, WAIT, BORROW, REPAIR, REFURBISH or RESELL.",
      },
      { property: "og:title", content: "SureShop — Don't buy more. Buy better." },
      {
        property: "og:description",
        content:
          "An AI purchase decision engine for Indian consumers: scan a product, get a transparent score and a clear decision.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { decisions } = useDecisions();
  const saved = decisions
    .filter((d) => d.decision !== "BUY")
    .reduce((s, d) => s + d.estimatedSavings, 0);

  return (
    <Screen>
      <header className="tb-rise flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tighter">SureShop</h1>
          <p className="mt-1 text-sm text-muted-foreground">Think before you buy.</p>
        </div>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <ShieldCheck className="size-3" /> Demo mode
        </span>
      </header>

      <Link
        to="/scan"
        search={{ mode: "camera" }}
        className="tb-tap active:tb-tap-active mt-6 block rounded-3xl bg-primary p-5 text-primary-foreground tb-rise"
      >
        <div className="flex items-center gap-4">
          <span className="relative grid size-14 place-items-center rounded-2xl bg-primary-foreground/12">
            <span className="tb-ring absolute inset-0 rounded-2xl border border-primary-foreground/40" />
            <Camera className="size-7" />
          </span>
          <span>
            <span className="block font-display text-lg font-bold">Scan a product</span>
            <span className="block text-sm opacity-75">
              Point your camera at a price tag or listing
            </span>
          </span>
        </div>
      </Link>

      <div className="mt-3 grid grid-cols-3 gap-3 tb-rise">
        <Action to="/scan" mode="link" icon={<Link2 className="size-5" />} label="Paste link" />
        <Action to="/scan" mode="voice" icon={<Mic className="size-5" />} label="Ask SureShop" />
        <Action
          to="/scan"
          mode="screenshot"
          icon={<ImageIcon className="size-5" />}
          label="Screenshot"
        />
      </div>

      <Card className="mt-4 flex items-center justify-between tb-rise">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Potentially saved
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-buy">{inr(saved)}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Analysed
          </div>
          <div className="mt-1 font-display text-2xl font-bold">{decisions.length}</div>
        </div>
        <TrendingDown className="size-8 text-buy/60" />
      </Card>

      <section className="mt-7">
        <SectionTitle>Recent decisions</SectionTitle>
        {decisions.length === 0 ? (
          <Card className="text-sm text-muted-foreground">
            No decisions yet. Scan something you’re tempted to buy — SureShop will tell you whether
            you should.
          </Card>
        ) : (
          <div className="space-y-2.5">
            {decisions.slice(0, 4).map((d) => (
              <Link
                key={d.id}
                to="/result/$id"
                params={{ id: d.id }}
                className="tb-tap active:tb-tap-active tb-card flex items-center gap-3 p-3.5"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-surface text-lg">
                  {d.product.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{d.product.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {inr(d.product.price)} · score {d.score}
                  </span>
                </span>
                <DecisionPill decision={d.decision} size="sm" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
        SureShop provides decision support, not financial advice.
        <br />
        Prices and resale values shown are estimates.
      </p>
    </Screen>
  );
}

function Action({
  to,
  mode,
  icon,
  label,
}: {
  to: "/scan";
  mode: "camera" | "link" | "voice" | "screenshot" | "manual";
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      search={{ mode }}
      className="tb-tap active:tb-tap-active tb-card flex flex-col items-center gap-2 p-3.5 text-center"
    >
      <span className="text-primary">{icon}</span>
      <span className="text-[11px] font-medium leading-tight">{label}</span>
    </Link>
  );
}
