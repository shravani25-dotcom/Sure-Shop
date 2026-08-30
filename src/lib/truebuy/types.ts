export type Decision = "BUY" | "WAIT" | "BORROW" | "REPAIR" | "REFURBISH" | "RESELL";

export type UsageFrequency = "daily" | "weekly" | "occasionally" | "rarely";
export type Urgency = "now" | "month" | "flexible";

export type Purpose =
  | "College"
  | "Gaming"
  | "Work"
  | "Content creation"
  | "Personal use"
  | "Other";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  /** Listed price right now (INR) */
  price: number;
  mrp: number;
  /** Typical / recent average street price (INR, estimated) */
  typicalPrice: number;
  fairPriceLow: number;
  fairPriceHigh: number;
  refurbPrice?: number | undefined;
  usedPrice?: number | undefined;
  /** Rental cost per single use, if the category is commonly rented */
  rentPerUse?: number | undefined;
  /** Typical repair cost for an existing unit of this category */
  repairCost?: number | undefined;
  /** Expected resale value after 1 year of ownership */
  resaleAfter1Year: number;
  lifetimeYears: number;
  /** Newer version expected in the next weeks? */
  refreshSoon?: boolean | undefined;
  discountFrequency: "low" | "medium" | "high";
  offerText?: string | undefined;
  envImpactNew: "Low" | "Medium" | "High";
  emoji: string;
  specs: string[];
  /** Search aliases used to match links, transcripts and AI vision labels */
  keywords?: string[] | undefined;
}

export interface PurchaseContext {
  purpose: Purpose;
  frequency: UsageFrequency;
  urgency: Urgency;
  /** User already owns a working similar product */
  ownsSimilar: boolean;
  /** User owns a similar product that is broken / degraded */
  ownsBroken: boolean;
  /** Resale value of the owned equivalent (INR, estimated) */
  ownedResaleValue?: number | undefined;
  /** Only needed for a limited number of months */
  neededMonths?: number | undefined;
  researchedBefore: boolean;
  urgencyMarketing: boolean;
}

export interface FinancialProfile {
  income: number;
  essentials: number;
  discretionary: number;
  savings: number;
  goal: string;
  monthlyShopping: number;
  demo: boolean;
}

export interface PastPurchase {
  id: string;
  name: string;
  category: string;
  price: number;
  monthsAgo: number;
}

export interface FactorScore {
  key: string;
  label: string;
  weight: number;
  score: number;
  note: string;
}

export interface Alternative {
  mode: Decision;
  label: string;
  price: number | null;
  note: string;
  savings: number;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  product: Product;
  context: PurchaseContext;
  decision: Decision;
  score: number;
  confidence: number;
  reasons: string[];
  positives: string[];
  warnings: string[];
  factors: FactorScore[];
  alternatives: Alternative[];
  estimatedSavings: number;
  impulseRisk: number;
  impulseNote: string;
  budgetImpactPct: number;
  costPerUse: number;
  expectedUses: number;
  effectiveCost: number;
  emi: { monthly: number; months: number; total: number; extra: number };
  pressureFlags: string[];
  headline: string;
  aiSummary?: string | undefined;
}
