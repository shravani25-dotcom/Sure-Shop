import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Card, DecisionPill, Screen, SectionTitle } from "@/components/truebuy/ui";
import { inr } from "@/lib/truebuy/engine";
import { useDecisions } from "@/lib/truebuy/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Decision history — SureShop" },
      {
        name: "description",
        content:
          "Every purchase you checked with SureShop, the score it received and how much you saved by not buying.",
      },
      { property: "og:title", content: "Decision history — SureShop" },
      {
        property: "og:description",
        content: "Track your past purchase decisions and total savings in one place.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { decisions, clearDecisions } = useDecisions();
  const saved = decisions
    .filter((d) => d.decision !== "BUY")
    .reduce((s, d) => s + d.estimatedSavings, 0);

  return (
    <Screen>
      <header className="tb-rise flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tighter">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {decisions.length} decision{decisions.length === 1 ? "" : "s"} · {inr(saved)} saved
          </p>
        </div>
        {decisions.length > 0 && (
          <button
            onClick={clearDecisions}
            className="tb-tap inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground"
          >
            <Trash2 className="size-3.5" /> Clear
          </button>
        )}
      </header>

      {decisions.length === 0 ? (
        <Card className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            No decisions yet. Scan a product and SureShop will keep the reasoning here.
          </p>
          <Link
            to="/scan"
            search={{ mode: "camera" }}
            className="tb-tap active:tb-tap-active mt-4 inline-block rounded-2xl bg-primary px-5 py-3 font-display text-sm font-bold text-primary-foreground"
          >
            Check a purchase
          </Link>
        </Card>
      ) : (
        <div className="mt-6 space-y-2">
          <SectionTitle>All decisions</SectionTitle>
          {decisions.map((d) => (
            <Link key={d.id} to="/result/$id" params={{ id: d.id }} className="block">
              <Card className="tb-tap active:tb-tap-active flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface text-xl">
                  {d.product.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{d.product.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {inr(d.product.price)} ·{" "}
                    {new Date(d.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <DecisionPill decision={d.decision} size="sm" />
                  <div className="mt-1 text-[11px] text-muted-foreground">{d.score}/100</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Screen>
  );
}
