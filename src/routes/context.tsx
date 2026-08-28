import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, Screen, SectionTitle } from "@/components/truebuy/ui";
import { getDraft, SOURCE_LABEL, type Draft } from "@/lib/truebuy/draft";
import { analyze, inr } from "@/lib/truebuy/engine";
import { saveDecision, useProfile, usePastPurchases } from "@/lib/truebuy/store";
import type { Purpose, PurchaseContext, UsageFrequency, Urgency } from "@/lib/truebuy/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/context")({
  head: () => ({
    meta: [
      { title: "Your context — TRUEBUY" },
      {
        name: "description",
        content:
          "Tell TRUEBUY why you need the product and how often you'll use it. Context is what turns a price into a decision.",
      },
      { property: "og:title", content: "Your context — TRUEBUY" },
      {
        property: "og:description",
        content: "Purpose, usage frequency and urgency feed the TRUEBUY decision engine.",
      },
    ],
  }),
  component: ContextPage,
});

const PURPOSES: Purpose[] = [
  "College",
  "Gaming",
  "Work",
  "Content creation",
  "Personal use",
  "Other",
];
const FREQ: { key: UsageFrequency; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Several times a week" },
  { key: "occasionally", label: "Occasionally" },
  { key: "rarely", label: "Rarely" },
];
const URGENCY: { key: Urgency; label: string }[] = [
  { key: "now", label: "I need it now" },
  { key: "month", label: "Within a month" },
  { key: "flexible", label: "No rush" },
];

function ContextPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { purchases } = usePastPurchases();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);

  const [purpose, setPurpose] = useState<Purpose>("College");
  const [frequency, setFrequency] = useState<UsageFrequency>("daily");
  const [urgency, setUrgency] = useState<Urgency>("month");
  const [ownsSimilar, setOwnsSimilar] = useState(false);
  const [ownsBroken, setOwnsBroken] = useState(false);
  const [shortTerm, setShortTerm] = useState(false);
  const [researched, setResearched] = useState(false);

  useEffect(() => {
    const d = getDraft();
    if (!d) navigate({ to: "/scan", search: { mode: "camera" } });
    else setDraft(d);
  }, [navigate]);

  const STEPS = ["Reading product data", "Applying your context", "Scoring 8 factors", "Writing explanation"];

  const run = () => {
    if (!draft) return;
    setRunning(true);
    setStep(0);
    const ctx: PurchaseContext = {
      purpose,
      frequency,
      urgency,
      ownsSimilar,
      ownsBroken,
      ownedResaleValue: ownsSimilar ? Math.round(draft.product.resaleAfter1Year * 0.7) : 0,
      neededMonths: shortTerm ? 3 : undefined,
      researchedBefore: researched,
      urgencyMarketing: Boolean(draft.product.offerText),
    };
    const result = analyze(draft.product, ctx, profile, purchases);
    const ticks = [420, 420, 480, 520];
    ticks.forEach((_, i) => setTimeout(() => setStep(i + 1), ticks.slice(0, i + 1).reduce((a, b) => a + b, 0)));
    setTimeout(() => {
      saveDecision(result);
      navigate({ to: "/result/$id", params: { id: result.id } });
    }, 1900);
  };

  if (!draft) return <Screen>{null}</Screen>;

  if (running)
    return (
      <Screen className="pt-24">
        <div className="text-center tb-rise">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <h1 className="mt-6 font-display text-xl font-bold">Analysing your purchase</h1>
          <p className="mt-1 text-sm text-muted-foreground">{draft.product.name}</p>
        </div>
        <div className="mt-8 space-y-2.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={cn(
                "tb-card flex items-center gap-3 p-3.5 text-sm transition-opacity",
                i < step ? "opacity-100" : "opacity-35",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  i < step ? "bg-primary" : "bg-muted-foreground/40",
                )}
              />
              {s}
            </div>
          ))}
        </div>
      </Screen>
    );

  return (
    <Screen>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
        {SOURCE_LABEL[draft.source]}
      </p>
      <Card className="mt-3 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-surface text-xl">
          {draft.product.emoji}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{draft.product.name}</div>
          <div className="text-xs text-muted-foreground">{inr(draft.product.price)}</div>
        </div>
      </Card>

      <div className="mt-6">
        <SectionTitle>What are you buying it for?</SectionTitle>
        <Chips
          options={PURPOSES.map((p) => ({ key: p, label: p }))}
          value={purpose}
          onChange={(v) => setPurpose(v as Purpose)}
        />
      </div>

      <div className="mt-6">
        <SectionTitle>How often will you use it?</SectionTitle>
        <Chips
          options={FREQ}
          value={frequency}
          onChange={(v) => setFrequency(v as UsageFrequency)}
        />
      </div>

      <div className="mt-6">
        <SectionTitle>How soon do you need it?</SectionTitle>
        <Chips options={URGENCY} value={urgency} onChange={(v) => setUrgency(v as Urgency)} />
      </div>

      <div className="mt-6 space-y-2.5">
        <SectionTitle>A few optional details</SectionTitle>
        <Toggle
          label="I already own something similar that works"
          value={ownsSimilar}
          onChange={setOwnsSimilar}
        />
        <Toggle
          label="I own a similar item that’s broken or degraded"
          value={ownsBroken}
          onChange={setOwnsBroken}
        />
        <Toggle label="I only need it for a few months" value={shortTerm} onChange={setShortTerm} />
        <Toggle
          label="I’ve been researching this for a while"
          value={researched}
          onChange={setResearched}
        />
      </div>

      <button
        onClick={run}
        className="tb-tap active:tb-tap-active mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-display text-base font-bold text-primary-foreground"
      >
        Get my TRUEBUY decision <ArrowRight className="size-4" />
      </button>
      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        No bank login, OTP, UPI PIN or card details — ever.
      </p>
    </Screen>
  );
}

function Chips({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            "tb-tap active:tb-tap-active rounded-full border px-3.5 py-2 text-xs font-semibold",
            value === o.key
              ? "border-primary bg-primary/12 text-primary"
              : "border-border bg-card text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="tb-tap active:tb-tap-active tb-card flex w-full items-center justify-between gap-3 p-3.5 text-left"
    >
      <span className="text-[13px]">{label}</span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          value ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-background transition-all",
            value ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}
