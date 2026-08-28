import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  ImageIcon,
  Keyboard,
  Link2,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useRef, useState } from "react";
import { Card, Estimated, Screen, SectionTitle } from "@/components/truebuy/ui";
import { DEMO_PRODUCTS, findDemoProduct } from "@/lib/truebuy/data";

const FIRST = DEMO_PRODUCTS[0]!;
import { setDraft, type Draft } from "@/lib/truebuy/draft";
import { detectPressure, inr } from "@/lib/truebuy/engine";
import type { Product } from "@/lib/truebuy/types";
import { cn } from "@/lib/utils";

type Mode = "camera" | "link" | "voice" | "screenshot" | "manual";

export const Route = createFileRoute("/scan")({
  validateSearch: (search: Record<string, unknown>): { mode: Mode } => ({
    mode: (["camera", "link", "voice", "screenshot", "manual"] as const).includes(
      search["mode"] as Mode,
    )
      ? (search["mode"] as Mode)
      : "camera",
  }),
  head: () => ({
    meta: [
      { title: "Scan a product — TRUEBUY" },
      {
        name: "description",
        content:
          "Scan a price tag, paste a shopping link, upload a screenshot or ask by voice. TRUEBUY identifies the product before deciding.",
      },
      { property: "og:title", content: "Scan a product — TRUEBUY" },
      {
        property: "og:description",
        content: "Camera, link, screenshot or voice input for an AI purchase decision.",
      },
    ],
  }),
  component: ScanPage,
});

const MODES: { key: Mode; label: string; icon: typeof Camera }[] = [
  { key: "camera", label: "Camera", icon: Camera },
  { key: "link", label: "Link", icon: Link2 },
  { key: "screenshot", label: "Screenshot", icon: ImageIcon },
  { key: "voice", label: "Voice", icon: Mic },
  { key: "manual", label: "Manual", icon: Keyboard },
];

function extractPrice(text: string): number | null {
  const m = text.replace(/,/g, "").match(/(?:₹|rs\.?|inr)\s*(\d{3,7})|(\d{4,7})\s*(?:rupees|rs)/i);
  if (!m) return null;
  const n = Number(m[1] ?? m[2]);
  return Number.isFinite(n) && n > 100 ? n : null;
}

function ScanPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();

  const go = (draft: Draft) => {
    setDraft(draft);
    navigate({ to: "/context" });
  };

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold">Identify the product</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Any input works. Everything falls back to demo data so the flow never breaks.
      </p>

      <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {MODES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => navigate({ to: "/scan", search: { mode: key } })}
            className={cn(
              "tb-tap flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold",
              mode === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {mode === "camera" && <CameraPanel onDone={go} />}
        {mode === "link" && <LinkPanel onDone={go} />}
        {mode === "screenshot" && <ScreenshotPanel onDone={go} />}
        {mode === "voice" && <VoicePanel onDone={go} />}
        {mode === "manual" && <ManualPanel onDone={go} />}
      </div>

      <section className="mt-8">
        <SectionTitle>Or pick a demo product</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {DEMO_PRODUCTS.map((p) => (
            <button
              key={p.id}
              onClick={() => go({ product: p, source: "demo" })}
              className="tb-tap active:tb-tap-active tb-card p-3.5 text-left"
            >
              <div className="text-xl">{p.emoji}</div>
              <div className="mt-2 line-clamp-2 text-xs font-semibold leading-snug">{p.name}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{inr(p.price)}</div>
            </button>
          ))}
        </div>
      </section>
    </Screen>
  );
}

function Confirm({
  product,
  note,
  flags,
  onConfirm,
}: {
  product: Product;
  note: string;
  flags?: string[];
  onConfirm: () => void;
}) {
  return (
    <Card className="mt-4 tb-rise">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" /> {note}
      </div>
      <div className="mt-3 flex items-start gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-surface text-xl">
          {product.emoji}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{product.name}</div>
          <div className="text-xs text-muted-foreground">
            {product.brand} · {product.category}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-display text-lg font-bold">{inr(product.price)}</span>
            <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {product.specs.map((s) => (
          <span key={s} className="rounded-full bg-surface px-2.5 py-1 text-[10px]">
            {s}
          </span>
        ))}
        <Estimated>Typical {inr(product.typicalPrice)}</Estimated>
      </div>
      {flags && flags.length > 0 && (
        <div className="mt-3 rounded-xl border border-wait/30 bg-wait/10 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-wait">
            <TriangleAlert className="size-3.5" /> Purchase pressure detected
          </div>
          <ul className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
            {flags.map((f) => (
              <li key={f}>· {f}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={onConfirm}
        className="tb-tap active:tb-tap-active mt-4 w-full rounded-2xl bg-primary py-3.5 font-display text-sm font-bold text-primary-foreground"
      >
        Looks right → add context
      </button>
    </Card>
  );
}

function CameraPanel({ onDone }: { onDone: (d: Draft) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "scanning" | "done">("idle");
  const [product, setProduct] = useState<Product>(FIRST);

  const handleFile = () => {
    setState("scanning");
    setTimeout(() => setState("done"), 1700);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="tb-tap active:tb-tap-active relative grid h-56 w-full place-items-center overflow-hidden rounded-3xl border border-dashed border-primary/40 bg-card"
      >
        {state === "scanning" ? (
          <div className="text-center">
            <Loader2 className="mx-auto size-7 animate-spin text-primary" />
            <p className="mt-3 text-xs text-muted-foreground">Reading text and price tag…</p>
          </div>
        ) : (
          <div className="text-center">
            <Camera className="mx-auto size-8 text-primary" />
            <p className="mt-3 text-sm font-semibold">Open camera</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Capture the product or its price tag
            </p>
          </div>
        )}
      </button>

      {state === "done" && (
        <>
          <div className="mt-4">
            <SectionTitle>Recognition result — correct it if wrong</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {DEMO_PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProduct(p)}
                  className={cn(
                    "tb-tap rounded-full border px-3 py-1.5 text-[11px]",
                    product.id === p.id
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {p.emoji} {p.category}
                </button>
              ))}
            </div>
          </div>
          <Confirm
            product={product}
            note="Extracted from image · simulated recognition"
            flags={detectPressure(product.offerText)}
            onConfirm={() => onDone({ product, source: "camera" })}
          />
        </>
      )}
    </div>
  );
}

function LinkPanel({ onDone }: { onDone: (d: Draft) => void }) {
  const [url, setUrl] = useState("");
  const [product, setProduct] = useState<Product | null>(null);

  const parse = () => {
    const match = findDemoProduct(url) ?? FIRST;
    const price = extractPrice(url);
    setProduct(price ? { ...match, price } : match);
  };

  return (
    <div>
      <Card>
        <label className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Product link or pasted listing text
        </label>
        <textarea
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          rows={3}
          placeholder="https://shop.example.in/sony-wh-1000xm5 … or paste the listing text with ₹ price"
          className="mt-2 w-full resize-none rounded-xl border border-input bg-surface p-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary"
        />
        <button
          onClick={parse}
          disabled={!url.trim()}
          className="tb-tap active:tb-tap-active mt-3 w-full rounded-2xl bg-primary py-3 font-display text-sm font-bold text-primary-foreground disabled:opacity-40"
        >
          Analyse link
        </button>
      </Card>
      {product && (
        <Confirm
          product={product}
          note="Matched against product dataset"
          flags={detectPressure(url + " " + (product.offerText ?? ""))}
          onConfirm={() => onDone({ product, source: "link" })}
        />
      )}
    </div>
  );
}

function ScreenshotPanel({ onDone }: { onDone: (d: Draft) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [offerText, setOfferText] = useState(
    "₹49,999 → ₹34,999 · 30% OFF · Only 2 left · Sale ends in 10 minutes",
  );
  const [product, setProduct] = useState<Product | null>(null);

  const parse = () => {
    const match = findDemoProduct(offerText) ?? FIRST;
    const price = extractPrice(offerText.split("→").pop() ?? offerText);
    setProduct({ ...match, price: price ?? match.price, offerText });
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={parse} />
      <Card>
        <button
          onClick={() => inputRef.current?.click()}
          className="tb-tap active:tb-tap-active grid h-32 w-full place-items-center rounded-2xl border border-dashed border-border bg-surface text-center"
        >
          <div>
            <ImageIcon className="mx-auto size-6 text-primary" />
            <p className="mt-2 text-xs font-semibold">Upload shopping screenshot</p>
          </div>
        </button>
        <label className="mt-4 block text-[11px] uppercase tracking-widest text-muted-foreground">
          Offer text found in the screenshot
        </label>
        <textarea
          value={offerText}
          onChange={(e) => setOfferText(e.target.value)}
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-input bg-surface p-3 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={parse}
          className="tb-tap active:tb-tap-active mt-3 w-full rounded-2xl bg-primary py-3 font-display text-sm font-bold text-primary-foreground"
        >
          Extract offer details
        </button>
      </Card>
      {product && (
        <Confirm
          product={product}
          note="Parsed from screenshot text"
          flags={detectPressure(offerText)}
          onConfirm={() => onDone({ product, source: "screenshot" })}
        />
      )}
    </div>
  );
}

function VoicePanel({ onDone }: { onDone: (d: Draft) => void }) {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [supported, setSupported] = useState(true);

  const parse = (value: string) => {
    const match = findDemoProduct(value) ?? FIRST;
    const price = extractPrice(value);
    setProduct(price ? { ...match, price } : match);
  };

  const listen = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const said = e.results[0][0].transcript as string;
      setText(said);
      parse(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      setSupported(false);
    };
    setListening(true);
    rec.start();
  };

  return (
    <div>
      <Card className="text-center">
        <button
          onClick={listen}
          className={cn(
            "tb-tap active:tb-tap-active relative mx-auto grid size-24 place-items-center rounded-full",
            listening ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground",
          )}
        >
          {listening && <span className="tb-ring absolute inset-0 rounded-full bg-destructive/40" />}
          {listening ? <MicOff className="size-9" /> : <Mic className="size-9" />}
        </button>
        <p className="mt-4 text-sm font-semibold">
          {listening ? "Listening…" : "Ask TRUEBUY out loud"}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          “Should I buy this phone for ₹35,000?” · Indian English
        </p>
        {!supported && (
          <p className="mt-3 text-[11px] text-wait">
            Speech recognition unavailable here — type your question instead.
          </p>
        )}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question"
          className="mt-4 w-full rounded-xl border border-input bg-surface p-3 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={() => parse(text)}
          disabled={!text.trim()}
          className="tb-tap active:tb-tap-active mt-3 w-full rounded-2xl bg-primary py-3 font-display text-sm font-bold text-primary-foreground disabled:opacity-40"
        >
          Ask TRUEBUY
        </button>
      </Card>
      {product && (
        <Confirm
          product={product}
          note="Understood from your question"
          onConfirm={() => onDone({ product, source: "voice", voiceNote: text })}
        />
      )}
    </div>
  );
}

function ManualPanel({ onDone }: { onDone: (d: Draft) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [base, setBase] = useState<Product>(FIRST);

  const build = (): Product => {
    const p = Number(price) || base.price;
    const factor = p / base.price;
    return {
      ...base,
      id: "manual-" + base.id,
      name: name.trim() || base.name,
      price: p,
      mrp: Math.round(base.mrp * factor),
      typicalPrice: Math.round(base.typicalPrice * factor),
      fairPriceLow: Math.round(base.fairPriceLow * factor),
      fairPriceHigh: Math.round(base.fairPriceHigh * factor),
      refurbPrice: base.refurbPrice ? Math.round(base.refurbPrice * factor) : undefined,
      usedPrice: base.usedPrice ? Math.round(base.usedPrice * factor) : undefined,
      resaleAfter1Year: Math.round(base.resaleAfter1Year * factor),
    };
  };

  return (
    <Card>
      <label className="text-[11px] uppercase tracking-widest text-muted-foreground">
        Product name
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Gaming Laptop XYZ"
        className="mt-2 w-full rounded-xl border border-input bg-surface p-3 text-sm outline-none focus:border-primary"
      />
      <label className="mt-4 block text-[11px] uppercase tracking-widest text-muted-foreground">
        Price (₹)
      </label>
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
        inputMode="numeric"
        placeholder="69999"
        className="mt-2 w-full rounded-xl border border-input bg-surface p-3 text-sm outline-none focus:border-primary"
      />
      <label className="mt-4 block text-[11px] uppercase tracking-widest text-muted-foreground">
        Category
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        {DEMO_PRODUCTS.map((p) => (
          <button
            key={p.id}
            onClick={() => setBase(p)}
            className={cn(
              "tb-tap rounded-full border px-3 py-1.5 text-[11px]",
              base.id === p.id
                ? "border-primary text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {p.category}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground">
        Reference prices are estimated from the category benchmark, not verified listings.
      </p>
      <button
        onClick={() => onDone({ product: build(), source: "manual" })}
        className="tb-tap active:tb-tap-active mt-4 w-full rounded-2xl bg-primary py-3.5 font-display text-sm font-bold text-primary-foreground"
      >
        Continue
      </button>
    </Card>
  );
}
