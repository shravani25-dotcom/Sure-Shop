import type { Product } from "./types";

const KEY = "truebuy.draft";

export interface Draft {
  product: Product;
  source: "camera" | "link" | "screenshot" | "voice" | "manual" | "demo";
  voiceNote?: string;
}

export function setDraft(draft: Draft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(draft));
}

export function getDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export const SOURCE_LABEL: Record<Draft["source"], string> = {
  camera: "Camera scan · simulated recognition",
  link: "Product link · parsed",
  screenshot: "Screenshot · parsed",
  voice: "Voice input",
  manual: "Entered manually",
  demo: "Demo product",
};
