import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, History, Home, User } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Decision } from "@/lib/truebuy/types";

export const DECISION_META: Record<
  Decision,
  { color: string; bg: string; ring: string; dot: string; label: string }
> = {
  BUY: { color: "text-buy", bg: "bg-buy/12", ring: "border-buy/40", dot: "bg-buy", label: "BUY" },
  WAIT: { color: "text-wait", bg: "bg-wait/12", ring: "border-wait/40", dot: "bg-wait", label: "WAIT" },
  BORROW: {
    color: "text-borrow",
    bg: "bg-borrow/12",
    ring: "border-borrow/40",
    dot: "bg-borrow",
    label: "BORROW",
  },
  REPAIR: {
    color: "text-repair",
    bg: "bg-repair/12",
    ring: "border-repair/40",
    dot: "bg-repair",
    label: "REPAIR",
  },
  REFURBISH: {
    color: "text-refurbish",
    bg: "bg-refurbish/12",
    ring: "border-refurbish/40",
    dot: "bg-refurbish",
    label: "REFURBISH",
  },
  RESELL: {
    color: "text-resell",
    bg: "bg-resell/12",
    ring: "border-resell/40",
    dot: "bg-resell",
    label: "RESELL",
  },
};

export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className={cn("mx-auto w-full max-w-md px-5 pt-6", className)}>{children}</div>
      <BottomNav />
    </div>
  );
}

export function Card({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("tb-card p-4", className)} {...rest}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h2>
  );
}

export function DecisionPill({
  decision,
  size = "md",
}: {
  decision: Decision;
  size?: "sm" | "md";
}) {
  const m = DECISION_META[decision];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-display font-semibold tracking-tight",
        m.bg,
        m.ring,
        m.color,
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-sm",
      )}
    >
      <span className={cn("size-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export function ScoreRing({ score, decision }: { score: number; decision: Decision }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const stroke = {
    BUY: "var(--buy)",
    WAIT: "var(--wait)",
    BORROW: "var(--borrow)",
    REPAIR: "var(--repair)",
    REFURBISH: "var(--refurbish)",
    RESELL: "var(--resell)",
  }[decision];

  return (
    <div className="relative grid size-[136px] place-items-center">
      <svg viewBox="0 0 128 128" className="absolute inset-0 -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--muted)" strokeWidth="9" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="text-center">
        <div className="font-display text-4xl font-bold leading-none">{score}</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          / 100
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/history", label: "History", icon: History },
  { to: "/insights", label: "Insights", icon: Compass },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-between px-4 py-2.5">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "tb-tap flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium tracking-wide",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Estimated({ children = "Estimated" }: { children?: ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  );
}
