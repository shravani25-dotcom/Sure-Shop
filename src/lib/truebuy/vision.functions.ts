import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const Input = z.object({
  /** data URL of the captured photo */
  image: z.string().min(32),
  mimeType: z.string().min(3),
});

export interface VisionGuess {
  label: string | null;
  brand: string | null;
  category: string | null;
  detectedPrice: number | null;
  offerText: string | null;
  specs: string[];
  confidence: number;
  note: string;
}

const EMPTY: VisionGuess = {
  label: null,
  brand: null,
  category: null,
  detectedPrice: null,
  offerText: null,
  specs: [],
  confidence: 0,
  note: "Recognition unavailable — pick the closest category below.",
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/[^\d]/g, ""));
    return Number.isFinite(n) && n > 100 ? n : null;
  }
  return null;
}

/**
 * Real camera recognition: sends the captured photo to a vision model and
 * returns what the model actually sees (product, brand, price tag text).
 * The client then matches this against the SureShop catalog for price priors.
 */
export const identifyProduct = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }): Promise<VisionGuess> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return EMPTY;

    const base64 = data.image.includes(",") ? data.image.split(",")[1]! : data.image;

    try {
      const gateway = createLovableAiGatewayProvider(key);
      const result = await generateText({
        model: gateway("google/gemini-3.7-flash"),
        messages: [
          {
            role: "system",
            content:
              "You identify consumer products in photos for an Indian shopping assistant. " +
              "Reply with ONLY minified JSON, no markdown, using this shape: " +
              '{"label":string,"brand":string|null,"category":string,"detectedPrice":number|null,' +
              '"offerText":string|null,"specs":string[],"confidence":number}. ' +
              "category must be a short generic category like Smartphone, Laptop, Headphones, Earbuds, Camera, " +
              "Tablet, Television, Smartwatch, Air conditioner, Refrigerator, Washing machine, Gaming console, " +
              "Bicycle, Footwear, Kitchen appliance, Projector. " +
              "detectedPrice: only if a price in ₹ is visibly printed (digits only, no symbols). " +
              "offerText: copy any discount/urgency wording visible. specs: up to 3 visible facts. " +
              "confidence: 0-1 for how sure you are about the product identity. Never invent a price.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "What product is this? Read any visible price tag or label." },
              { type: "image", image: base64, mediaType: data.mimeType },
            ],
          },
        ],
      });

      const raw = result.text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(raw) as Record<string, unknown>;

      const confidence = Math.max(0, Math.min(1, Number(parsed["confidence"]) || 0.6));
      return {
        label: typeof parsed["label"] === "string" ? parsed["label"] : null,
        brand: typeof parsed["brand"] === "string" ? parsed["brand"] : null,
        category: typeof parsed["category"] === "string" ? parsed["category"] : null,
        detectedPrice: toNumber(parsed["detectedPrice"]),
        offerText: typeof parsed["offerText"] === "string" ? parsed["offerText"] : null,
        specs: Array.isArray(parsed["specs"])
          ? (parsed["specs"] as unknown[]).filter((s): s is string => typeof s === "string").slice(0, 3)
          : [],
        confidence,
        note: "Recognised from your photo by AI vision",
      };
    } catch {
      return EMPTY;
    }
  });
