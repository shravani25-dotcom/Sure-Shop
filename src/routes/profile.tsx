import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Card, Screen, SectionTitle } from "@/components/truebuy/ui";
import { inr } from "@/lib/truebuy/engine";
import { usePastPurchases, useProfile } from "@/lib/truebuy/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — TRUEBUY" },
      {
        name: "description",
        content:
          "Set your monthly income, essentials, savings goal and past purchases so TRUEBUY can judge budget impact accurately.",
      },
      { property: "og:title", content: "Your profile — TRUEBUY" },
      {
        property: "og:description",
        content: "Budget context powers the TRUEBUY score. No bank login, ever.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, saveProfile } = useProfile();
  const { purchases, addPurchase, removePurchase } = usePastPurchases();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");

  const set = (patch: Partial<typeof profile>) => saveProfile({ ...profile, ...patch, demo: false });

  const freeCash = profile.income - profile.essentials - profile.savings;

  const add = () => {
    if (!name.trim() || !Number(price)) return;
    addPurchase({
      name: name.trim(),
      category: category.trim() || "Other",
      price: Number(price),
      monthsAgo: 1,
    });
    setName("");
    setCategory("");
    setPrice("");
  };

  return (
    <Screen>
      <header className="tb-rise flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tighter">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Budget context makes the score honest.
          </p>
        </div>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <ShieldCheck className="size-3" /> On-device
        </span>
      </header>

      <div className="mt-6">
        <SectionTitle>Monthly money (₹)</SectionTitle>
        <Card className="space-y-3.5">
          <Field
            label="Income"
            value={profile.income}
            onChange={(v) => set({ income: v })}
          />
          <Field
            label="Essentials (rent, food, bills)"
            value={profile.essentials}
            onChange={(v) => set({ essentials: v })}
          />
          <Field
            label="Savings / investments"
            value={profile.savings}
            onChange={(v) => set({ savings: v })}
          />
          <Field
            label="Typical shopping spend"
            value={profile.monthlyShopping}
            onChange={(v) => set({ monthlyShopping: v })}
          />
          <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
            <span className="text-muted-foreground">Free cash each month</span>
            <span className="font-display text-sm font-bold">{inr(Math.max(0, freeCash))}</span>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <SectionTitle>Savings goal</SectionTitle>
        <Card>
          <input
            value={profile.goal}
            onChange={(e) => set({ goal: e.target.value })}
            placeholder="e.g. Emergency fund"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </Card>
      </div>

      <div className="mt-6">
        <SectionTitle>Recent purchases</SectionTitle>
        <Card className="space-y-2.5">
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item"
              className="min-w-0 flex-1 rounded-xl bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="₹"
              className="w-24 rounded-xl bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              className="min-w-0 flex-1 rounded-xl bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={add}
              className="tb-tap active:tb-tap-active inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="size-4" /> Add
            </button>
          </div>
        </Card>

        <div className="mt-2 space-y-2">
          {purchases.map((p) => (
            <Card key={p.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {p.category} · {p.monthsAgo} month{p.monthsAgo === 1 ? "" : "s"} ago
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-display text-sm font-bold">{inr(p.price)}</span>
                <button
                  onClick={() => removePurchase(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="tb-tap text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-[10px] leading-relaxed text-muted-foreground">
        TRUEBUY never asks for bank logins, OTPs, UPI PINs or card details. Everything you enter
        stays on this device.
      </p>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <input
        value={value === 0 ? "" : String(value)}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
        inputMode="numeric"
        placeholder="0"
        className="w-28 rounded-xl bg-surface px-3 py-2 text-right text-sm font-semibold outline-none"
      />
    </label>
  );
}
