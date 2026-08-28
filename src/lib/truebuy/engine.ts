import type {
  Alternative,
  AnalysisResult,
  Decision,
  FactorScore,
  FinancialProfile,
  PastPurchase,
  Product,
  PurchaseContext,
} from "./types";

/** Configurable weights for the TRUEBUY score (must sum to 1). */
export const WEIGHTS = {
  priceValue: 0.2,
  need: 0.2,
  usage: 0.15,
  budget: 0.15,
  alternatives: 0.1,
  timing: 0.1,
  ownership: 0.05,
  resale: 0.05,
};

const USES_PER_YEAR: Record<PurchaseContext["frequency"], number> = {
  daily: 300,
  weekly: 100,
  occasionally: 20,
  rarely: 3,
};

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round = (n: number) => Math.round(n);

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export function detectPressure(text?: string): string[] {
  if (!text) return [];
  const flags: string[] = [];
  const t = text.toLowerCase();
  if (/only \d+ left|last \d+|few left|limited stock/.test(t)) flags.push("Scarcity claim: “only a few left”");
  if (/ends|hours|minutes|today|tonight|deal of the day|limited-period|limited time/.test(t))
    flags.push("Countdown / limited-time framing");
  if (/\d+\s*(people|users) (are )?viewing/.test(t)) flags.push("Social-pressure counter");
  if (/(\d{2,})%\s*off|flat \d+% off/.test(t)) flags.push("Large headline discount claim");
  return flags;
}

export function analyze(
  product: Product,
  context: PurchaseContext,
  profile: FinancialProfile,
  history: PastPurchase[],
): AnalysisResult {
  const usesPerYear = USES_PER_YEAR[context.frequency];
  const horizonYears = context.neededMonths
    ? Math.max(context.neededMonths / 12, 0.1)
    : product.lifetimeYears;
  const expectedUses = Math.max(1, round(usesPerYear * horizonYears));

  // ---------- factor scores ----------
  const priceRatio = product.price / product.typicalPrice;
  const priceValue = clamp(100 - (priceRatio - 1) * 450);

  const needBase = { now: 92, month: 70, flexible: 45 }[context.urgency];
  const purposeBoost = ["College", "Work", "Content creation"].includes(context.purpose) ? 8 : 0;
  const need = clamp(needBase + purposeBoost - (context.ownsSimilar ? 25 : 0));

  const usage = clamp({ daily: 95, weekly: 78, occasionally: 42, rarely: 12 }[context.frequency]);

  const budgetPct = profile.discretionary > 0 ? (product.price / profile.discretionary) * 100 : 999;
  const budget = clamp(110 - budgetPct / 3.2);

  const cheapest = Math.min(
    product.refurbPrice ?? Infinity,
    product.usedPrice ?? Infinity,
    product.price,
  );
  const altSavingsPct = ((product.price - cheapest) / product.price) * 100;
  const alternatives = clamp(100 - altSavingsPct * 1.9);

  const timingPenalty =
    (priceRatio > 1 ? (priceRatio - 1) * 380 : 0) +
    ({ low: 0, medium: 10, high: 22 }[product.discountFrequency] ?? 0) +
    (product.refreshSoon ? 18 : 0);
  const timing = clamp(100 - timingPenalty);

  const ownership = context.ownsSimilar ? 12 : context.ownsBroken ? 45 : 100;

  const resaleRatio = product.resaleAfter1Year / product.price;
  const resale = clamp(resaleRatio * 165);

  const factors: FactorScore[] = [
    {
      key: "priceValue",
      label: "Price value",
      weight: WEIGHTS.priceValue,
      score: round(priceValue),
      note: `${inr(product.price)} vs typical ${inr(product.typicalPrice)} (estimated)`,
    },
    {
      key: "need",
      label: "Need / utility",
      weight: WEIGHTS.need,
      score: round(need),
      note: `${context.purpose} · urgency: ${context.urgency === "now" ? "needed now" : context.urgency === "month" ? "this month" : "flexible"}`,
    },
    {
      key: "usage",
      label: "Usage frequency",
      weight: WEIGHTS.usage,
      score: round(usage),
      note: `${context.frequency} · ~${expectedUses} uses expected`,
    },
    {
      key: "budget",
      label: "Budget compatibility",
      weight: WEIGHTS.budget,
      score: round(budget),
      note: `${round(budgetPct)}% of monthly discretionary budget`,
    },
    {
      key: "alternatives",
      label: "Alternative availability",
      weight: WEIGHTS.alternatives,
      score: round(alternatives),
      note:
        altSavingsPct > 1
          ? `Cheaper option at ${inr(cheapest)} (${round(altSavingsPct)}% less)`
          : "No materially cheaper option found",
    },
    {
      key: "timing",
      label: "Price timing",
      weight: WEIGHTS.timing,
      score: round(timing),
      note: `${product.discountFrequency} discount frequency${product.refreshSoon ? " · newer model expected" : ""}`,
    },
    {
      key: "ownership",
      label: "Existing ownership",
      weight: WEIGHTS.ownership,
      score: round(ownership),
      note: context.ownsSimilar
        ? "You already own a working equivalent"
        : context.ownsBroken
          ? "You own a similar item that needs repair"
          : "No overlap with what you own",
    },
    {
      key: "resale",
      label: "Resale potential",
      weight: WEIGHTS.resale,
      score: round(resale),
      note: `~${inr(product.resaleAfter1Year)} after 1 year (estimated)`,
    },
  ];

  const score = clamp(round(factors.reduce((s, f) => s + f.score * f.weight, 0)));

  // ---------- money maths ----------
  const costPerUse = product.price / expectedUses;
  const effectiveCost = product.price - product.resaleAfter1Year;
  const months = 12;
  const monthlyEmi = Math.round((product.price * 1.16) / months);
  const emiTotal = monthlyEmi * months;

  // ---------- duplicate detection ----------
  const duplicate = history.find(
    (h) => h.category.toLowerCase() === product.category.toLowerCase(),
  );

  // ---------- decision rules (ordered) ----------
  const rentTotal = product.rentPerUse ? product.rentPerUse * expectedUses : Infinity;
  const refurbSavings = product.refurbPrice ? product.price - product.refurbPrice : 0;
  const refurbPct = product.refurbPrice ? (refurbSavings / product.price) * 100 : 0;

  let decision: Decision;
  if (context.ownsSimilar && usesPerYear <= 100 && (context.ownedResaleValue ?? 0) > 0) {
    decision = "RESELL";
  } else if (
    context.ownsBroken &&
    product.repairCost !== undefined &&
    product.repairCost < product.price * 0.45
  ) {
    decision = "REPAIR";
  } else if (product.rentPerUse !== undefined && rentTotal < product.price * 0.5 && usesPerYear <= 20) {
    decision = "BORROW";
  } else if (refurbPct >= 18 && score < 78) {
    decision = "REFURBISH";
  } else if (score < 62 || priceRatio > 1.05 || product.refreshSoon) {
    decision = "WAIT";
  } else {
    decision = "BUY";
  }

  // ---------- reasons ----------
  const positives: string[] = [];
  const warnings: string[] = [];
  if (budget >= 60) positives.push(`Fits your budget — ${round(budgetPct)}% of monthly discretionary spend`);
  if (usage >= 70) positives.push("Expected usage is high enough to justify ownership");
  if (priceValue >= 70) positives.push(`Price is within the estimated fair range (${inr(product.fairPriceLow)}–${inr(product.fairPriceHigh)})`);
  if (resale >= 55) positives.push(`Holds value well — about ${inr(product.resaleAfter1Year)} resale after a year`);
  if (need >= 80) positives.push("You have a clear, near-term need for this");

  if (priceRatio > 1.02)
    warnings.push(
      `Current price is ~${round((priceRatio - 1) * 100)}% above its recent typical price of ${inr(product.typicalPrice)}`,
    );
  if (budgetPct > 60)
    warnings.push(`This would use ${round(budgetPct)}% of your monthly discretionary budget`);
  if (usage <= 45)
    warnings.push(`Expected usage is low — cost per use works out to ${inr(costPerUse)}`);
  if (refurbPct >= 15)
    warnings.push(`A refurbished unit is about ${inr(refurbSavings)} cheaper`);
  if (product.usedPrice && product.price - product.usedPrice > product.price * 0.25)
    warnings.push(`Used market listings start near ${inr(product.usedPrice)}`);
  if (context.ownsSimilar) warnings.push("You already own a similar working product");
  if (duplicate)
    warnings.push(
      `Your history shows a ${duplicate.name.toLowerCase()} bought ${duplicate.monthsAgo} months ago`,
    );
  if (product.refreshSoon) warnings.push("A newer version of this model is expected soon");
  if (product.rentPerUse && rentTotal < product.price)
    warnings.push(`Renting for your usage would cost about ${inr(rentTotal)} in total`);

  const reasons =
    decision === "BUY"
      ? [...positives, ...warnings].slice(0, 5)
      : [...warnings, ...positives].slice(0, 5);

  // ---------- alternatives ----------
  const alts: Alternative[] = [];
  if (product.refurbPrice)
    alts.push({
      mode: "REFURBISH",
      label: "Certified refurbished",
      price: product.refurbPrice,
      note: "Warranty typically 6–12 months",
      savings: product.price - product.refurbPrice,
    });
  if (product.usedPrice)
    alts.push({
      mode: "RESELL",
      label: "Buy used (verified seller)",
      price: product.usedPrice,
      note: "No warranty · inspect before paying",
      savings: product.price - product.usedPrice,
    });
  if (product.rentPerUse)
    alts.push({
      mode: "BORROW",
      label: `Rent / borrow (~${inr(product.rentPerUse)} per use)`,
      price: round(rentTotal),
      note: `For ~${expectedUses} uses`,
      savings: Math.max(0, product.price - rentTotal),
    });
  if (product.repairCost && context.ownsBroken)
    alts.push({
      mode: "REPAIR",
      label: "Repair what you own",
      price: product.repairCost,
      note: "Estimated local service cost",
      savings: product.price - product.repairCost,
    });
  alts.push({
    mode: "WAIT",
    label: "Wait 2–4 weeks",
    price: null,
    note: `Likely price band ${inr(product.fairPriceLow)}–${inr(product.fairPriceHigh)}`,
    savings: Math.max(0, product.price - product.fairPriceHigh),
  });

  const estimatedSavings =
    decision === "BUY" ? 0 : Math.max(0, ...alts.map((a) => a.savings));

  // ---------- impulse risk ----------
  const pressureFlags = detectPressure(product.offerText);
  let impulse = 18;
  impulse += pressureFlags.length * 12;
  if (!context.researchedBefore) impulse += 18;
  if (context.urgency === "flexible" && usesPerYear <= 20) impulse += 12;
  if (product.price > profile.monthlyShopping * 2) impulse += 10;
  if (duplicate && duplicate.monthsAgo <= 6) impulse += 10;
  if (context.urgencyMarketing) impulse += 8;
  const impulseRisk = clamp(round(impulse));

  const impulseNote =
    impulseRisk >= 60
      ? "This decision shows several impulse markers — mostly urgency-based marketing and limited prior research."
      : impulseRisk >= 35
        ? "Some impulse markers present, but your stated need balances them out."
        : "This looks like a considered purchase rather than an impulse one.";

  const confidence = clamp(round(62 + Math.abs(score - 62) * 0.55 + (reasons.length >= 4 ? 8 : 0)), 55, 96) / 100;

  const headline: string = {
    BUY: "Good value for your use case.",
    WAIT: "Good product, but not a good time to buy.",
    BORROW: "You don’t need to own this.",
    REPAIR: "Fixing what you have costs far less.",
    REFURBISH: "Same job, meaningfully less money.",
    RESELL: "You already own this capability.",
  }[decision];

  return {
    id: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
    product,
    context,
    decision,
    score,
    confidence,
    reasons,
    positives,
    warnings,
    factors,
    alternatives: alts,
    estimatedSavings,
    impulseRisk,
    impulseNote,
    budgetImpactPct: round(budgetPct),
    costPerUse: round(costPerUse),
    expectedUses,
    effectiveCost,
    emi: { monthly: monthlyEmi, months, total: emiTotal, extra: emiTotal - product.price },
    pressureFlags,
    headline,
  };
}

/** Deterministic explanation used when the AI layer is unavailable. */
export function fallbackSummary(r: AnalysisResult): string {
  const top = r.reasons.slice(0, 2).join(" ");
  if (r.decision === "BUY")
    return `Based on your usage and today’s pricing, this is a reasonable buy. ${top}`;
  if (r.decision === "WAIT")
    return `Nothing wrong with the product — the timing is the problem. ${top} Waiting or picking a cheaper route protects about ${inr(r.estimatedSavings)}.`;
  if (r.decision === "BORROW")
    return `At roughly ${inr(r.costPerUse)} per use, ownership is the expensive way to solve this. Renting or borrowing covers the same need.`;
  if (r.decision === "REPAIR")
    return `Repairing the unit you already own restores the same function for a fraction of ${inr(r.product.price)}.`;
  if (r.decision === "REFURBISH")
    return `A certified refurbished unit does the same job and keeps about ${inr(r.estimatedSavings)} in your account.`;
  return `You already own an equivalent you barely use. Selling it recovers money instead of adding a second device.`;
}
