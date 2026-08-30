import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, TrendingDown, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Card,
  DecisionPill,
  Estimated,
  ScoreRing,
  Screen,
  SectionTitle,
} from "@/components/truebuy/ui";
import { explainDecision } from "@/lib/explain.functions";
import { fallbackSummary, inr } from "@/lib/truebuy/engine";
import { getDecision, updateDecision } from "@/lib/truebuy/store";
import type { AnalysisResult } from "@/lib/truebuy/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/result/$id")({
  head: () => ({
    meta: [
      { title: "Your decision — SureShop" },
      {
        name: "description",
        content:
          "A transparent 0-100 SureShop score with the eight factors behind it, smarter alternatives and the money you save.",
      },
      { property: "og:title", content: "Your SureShop decision" },
      {
        property: "og:description",
        content: "See the score, the reasoning and the alternatives before you spend.",
      },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    const r = getDecision(id);
    if (!r) {
      navigate({ to: "/" });
      return;
    }
    setResult(r);
    setSummary(r.aiSummary ?? null);
    if (r.aiSummary) return;

    let cancelled = false;
    explainDecision({
      data: {
        decision: r.decision,
        score: r.score,
        headline: r.headline,
        product: r.product.name,
        price: r.product.price,
        reasons: r.reasons,
        costPerUse: r.costPerUse,
        budgetImpactPct: r.budgetImpactPct,
        estimatedSavings: r.estimatedSavings,
      },
    })
      .then((res) => {
        if (cancelled) return;
        const text = res.summary ?? fallbackSummary(r);
        setSummary(text);
        updateDecision(r.id, { aiSummary: text });
      })
      .catch(() => {
        if (!cancelled) setSummary(fallbackSummary(r));
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (!result) return <Screen>{null}</Screen>;
  const r = result;

  return (
    <Screen>
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="tb-tap inline-flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <ArrowLeft className="size-4" /> Home
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Confidence {r.confidence}%
        </span>
      </div>

      <div className="tb-rise mt-4 flex flex-col items-center text-center">
        <ScoreRing score={r.score} decision={r.decision} />
        <div className="mt-4">
          <DecisionPill decision={r.decision} />
        </div>
        <h1 className="mt-3 font-display text-xl font-bold leading-snug">{r.headline}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {r.product.name} · {inr(r.product.price)}
        </p>
      </div>

      <Card className="mt-5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" /> AI explanation
        </div>
        <p className="mt-2 text-sm leading-relaxed">
          {summary ?? "Writing your explanation…"}
        </p>
      </Card>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Cost per use" value={inr(r.costPerUse)} hint={`${r.expectedUses} uses est.`} />
        <Stat label="Budget impact" value={`${r.budgetImpactPct}%`} hint="of monthly income" />
        <Stat label="Effective cost" value={inr(r.effectiveCost)} hint="after resale value" />
        <Stat
          label="EMI option"
          value={`${inr(r.emi.monthly)}/mo`}
          hint={`${r.emi.months} mo · +${inr(r.emi.extra)} interest`}
        />
      </div>

      <div className="mt-6">
        <SectionTitle>Why this decision</SectionTitle>
        <div className="space-y-2">
          {r.reasons.map((reason) => (
            <Card key={reason} className="text-sm leading-relaxed">
              {reason}
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <SectionTitle>The 8 factors</SectionTitle>
        <Card className="space-y-3.5">
          {r.factors.map((f) => (
            <div key={f.key}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold">{f.label}</span>
                <span className="text-muted-foreground">
                  {f.score}/100 · weight {Math.round(f.weight * 100)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700"
                  style={{ width: `${f.score}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{f.note}</p>
            </div>
          ))}
        </Card>
      </div>

      {r.alternatives.length > 0 && (
        <div className="mt-6">
          <SectionTitle>Smarter alternatives</SectionTitle>
          <div className="space-y-2">
            {r.alternatives.map((a) => (
              <Card key={a.label} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <DecisionPill decision={a.mode} size="sm" />
                  </div>
                  <div className="mt-2 text-sm font-semibold">{a.label}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.note}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-sm font-bold">
                    {a.price === null ? "—" : inr(a.price)}
                  </div>
                  {a.savings > 0 && (
                    <div className="mt-0.5 text-[11px] font-medium text-buy">
                      saves {inr(a.savings)}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <SectionTitle>Impulse check</SectionTitle>
        <Card>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">Impulse risk</span>
            <span className="text-muted-foreground">{r.impulseRisk}/100</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                r.impulseRisk > 60 ? "bg-wait" : "bg-buy",
              )}
              style={{ width: `${r.impulseRisk}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{r.impulseNote}</p>
          {r.pressureFlags.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {r.pressureFlags.map((flag) => (
                <li key={flag} className="flex items-start gap-2 text-xs text-wait">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {r.estimatedSavings > 0 && (
        <Card className="mt-5 flex items-center gap-3 border-buy/40 bg-buy/8">
          <TrendingDown className="size-5 text-buy" />
          <div>
            <div className="font-display text-lg font-bold text-buy">
              {inr(r.estimatedSavings)}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              potential saving <Estimated />
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6 flex gap-2">
        <Link
          to="/scan"
          search={{ mode: "camera" }}
          className="tb-tap active:tb-tap-active flex-1 rounded-2xl bg-primary py-3.5 text-center font-display text-sm font-bold text-primary-foreground"
        >
          Check another
        </Link>
        <Link
          to="/history"
          className="tb-tap active:tb-tap-active flex-1 rounded-2xl border border-border bg-card py-3.5 text-center font-display text-sm font-bold"
        >
          My history
        </Link>
      </div>
    </Screen>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg font-bold">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
    </Card>
  );
}
