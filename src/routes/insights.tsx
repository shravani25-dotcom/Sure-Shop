import { createFileRoute } from "@tanstack/react-router";
import { Leaf, PiggyBank, Repeat, TrendingDown } from "lucide-react";
import { Card, DecisionPill, Estimated, Screen, SectionTitle } from "@/components/truebuy/ui";
import { inr } from "@/lib/truebuy/engine";
import { useDecisions, usePastPurchases, useProfile } from "@/lib/truebuy/store";
import type { Decision } from "@/lib/truebuy/types";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Spending insights — TRUEBUY" },
      {
        name: "description",
        content:
          "See your buying patterns: money saved, decision mix, repeat categories and the environmental impact you avoided.",
      },
      { property: "og:title", content: "Spending insights — TRUEBUY" },
      {
        property: "og:description",
        content: "Patterns, savings and impact from your TRUEBUY decisions.",
      },
    ],
  }),
  component: InsightsPage,
});

const MODES: Decision[] = ["BUY", "WAIT", "BORROW", "REPAIR", "REFURBISH", "RESELL"];

function InsightsPage() {
  const { decisions } = useDecisions();
  const { purchases } = usePastPurchases();
  const { profile } = useProfile();

  const saved = decisions
    .filter((d) => d.decision !== "BUY")
    .reduce((s, d) => s + d.estimatedSavings, 0);
  const avoided = decisions.filter((d) => d.decision !== "BUY").length;
  const avgScore = decisions.length
    ? Math.round(decisions.reduce((s, d) => s + d.score, 0) / decisions.length)
    : 0;

  const counts = MODES.map((m) => ({
    mode: m,
    count: decisions.filter((d) => d.decision === m).length,
  }));
  const maxCount = Math.max(1, ...counts.map((c) => c.count));

  const byCategory = new Map<string, number>();
  purchases.forEach((p) => byCategory.set(p.category, (byCategory.get(p.category) ?? 0) + p.price));
  const categories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const catMax = Math.max(1, ...categories.map(([, v]) => v));

  const savingsRatePct = profile.income
    ? Math.round((profile.savings / profile.income) * 100)
    : 0;

  return (
    <Screen>
      <header className="tb-rise">
        <h1 className="font-display text-2xl font-extrabold tracking-tighter">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Patterns TRUEBUY noticed in how you spend.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Tile
          icon={<TrendingDown className="size-4 text-buy" />}
          label="Saved"
          value={inr(saved)}
          hint={`${avoided} purchase${avoided === 1 ? "" : "s"} avoided`}
        />
        <Tile
          icon={<PiggyBank className="size-4 text-primary" />}
          label="Savings rate"
          value={`${savingsRatePct}%`}
          hint="of monthly income"
        />
        <Tile
          icon={<Repeat className="size-4 text-refurbish" />}
          label="Avg score"
          value={`${avgScore}/100`}
          hint={`${decisions.length} decisions`}
        />
        <Tile
          icon={<Leaf className="size-4 text-borrow" />}
          label="Impact avoided"
          value={`${avoided} units`}
          hint="not manufactured"
        />
      </div>

      <div className="mt-7">
        <SectionTitle>Decision mix</SectionTitle>
        <Card className="space-y-3">
          {counts.map(({ mode, count }) => (
            <div key={mode} className="flex items-center gap-3">
              <div className="w-24 shrink-0">
                <DecisionPill decision={mode} size="sm" />
              </div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-5 shrink-0 text-right text-xs text-muted-foreground">
                {count}
              </span>
            </div>
          ))}
        </Card>
      </div>

      <div className="mt-7">
        <SectionTitle>Where your money went</SectionTitle>
        {categories.length === 0 ? (
          <Card className="text-sm text-muted-foreground">
            Add past purchases in your profile to unlock category patterns.
          </Card>
        ) : (
          <Card className="space-y-3">
            {categories.map(([cat, total]) => (
              <div key={cat}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold">{cat}</span>
                  <span className="text-muted-foreground">{inr(total)}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-refurbish transition-[width] duration-700"
                    style={{ width: `${(total / catMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <div className="mt-7">
        <SectionTitle>What this means</SectionTitle>
        <Card className="space-y-2 text-sm leading-relaxed">
          <p>
            You currently keep {savingsRatePct}% of your income aside for{" "}
            <span className="font-semibold">{profile.goal}</span>.
          </p>
          <p className="text-muted-foreground">
            Every WAIT, BORROW or REPAIR decision pushes money back into that goal instead of into
            depreciation.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Estimated>All figures estimated</Estimated>
          </div>
        </Card>
      </div>
    </Screen>
  );
}

function Tile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 font-display text-lg font-bold">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
    </Card>
  );
}
