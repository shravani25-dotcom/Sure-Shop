import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const Input = z.object({
  decision: z.string(),
  score: z.number(),
  headline: z.string(),
  product: z.string(),
  price: z.number(),
  reasons: z.array(z.string()),
  costPerUse: z.number(),
  budgetImpactPct: z.number(),
  estimatedSavings: z.number(),
});

/**
 * AI explanation layer. It only rewrites the structured output of the decision
 * engine into natural language — it is never allowed to invent prices or facts.
 */
export const explainDecision = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { summary: null as string | null };

    try {
      const gateway = createLovableAiGatewayProvider(key);
      const result = await generateText({
        model: gateway("google/gemini-3.7-flash"),
        system:
          "You are TRUEBUY, an AI purchase-decision engine for Indian consumers. " +
          "You receive a structured decision from a deterministic scoring engine. " +
          "Rewrite it as a calm, neutral 2-3 sentence explanation in Indian English. " +
          "Use ONLY the numbers and facts given to you — never invent prices, specs, discounts or dates. " +
          "Never shame the user. Never say 'as an AI'. Amounts in ₹ (Indian digit grouping).",
        prompt: JSON.stringify(data),
      });
      return { summary: result.text.trim() };
    } catch {
      return { summary: null as string | null };
    }
  });
