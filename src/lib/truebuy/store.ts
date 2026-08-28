import { useCallback, useEffect, useState } from "react";
import { DEMO_HISTORY, DEMO_PROFILE } from "./data";
import type { AnalysisResult, FinancialProfile, PastPurchase } from "./types";

const KEYS = {
  profile: "truebuy.profile",
  purchases: "truebuy.purchases",
  decisions: "truebuy.decisions",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("truebuy:update"));
  } catch {
    /* storage unavailable — app still works in-memory */
  }
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setValue(read(key, fallback));
    sync();
    setHydrated(true);
    window.addEventListener("truebuy:update", sync);
    return () => window.removeEventListener("truebuy:update", sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = useCallback(
    (next: T) => {
      setValue(next);
      write(key, next);
    },
    [key],
  );

  return { value, save, hydrated };
}

export function useProfile() {
  const { value, save, hydrated } = useStored<FinancialProfile>(KEYS.profile, DEMO_PROFILE);
  return { profile: value, saveProfile: save, hydrated };
}

export function usePastPurchases() {
  const { value, save } = useStored<PastPurchase[]>(KEYS.purchases, DEMO_HISTORY);
  const add = (p: Omit<PastPurchase, "id">) =>
    save([{ ...p, id: Math.random().toString(36).slice(2, 8) }, ...value]);
  const remove = (id: string) => save(value.filter((p) => p.id !== id));
  return { purchases: value, addPurchase: add, removePurchase: remove, setPurchases: save };
}

export function useDecisions() {
  const { value, save, hydrated } = useStored<AnalysisResult[]>(KEYS.decisions, []);
  const add = (r: AnalysisResult) => save([r, ...value].slice(0, 60));
  const clear = () => save([]);
  return { decisions: value, addDecision: add, clearDecisions: clear, hydrated };
}

/** Read/write helpers for the analysis hand-off between routes. */
export function saveDecision(r: AnalysisResult) {
  const list = read<AnalysisResult[]>(KEYS.decisions, []);
  write(KEYS.decisions, [r, ...list].slice(0, 60));
}

export function getDecision(id: string): AnalysisResult | undefined {
  return read<AnalysisResult[]>(KEYS.decisions, []).find((d) => d.id === id);
}

export function updateDecision(id: string, patch: Partial<AnalysisResult>) {
  const list = read<AnalysisResult[]>(KEYS.decisions, []);
  write(
    KEYS.decisions,
    list.map((d) => (d.id === id ? { ...d, ...patch } : d)),
  );
}
