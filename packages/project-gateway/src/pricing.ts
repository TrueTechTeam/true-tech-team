import type { ModelPricing } from './types';

// Base Anthropic API pricing per model, USD per million tokens. Verified
// against platform.claude.com/docs/en/models/opus-4-5/overview — update
// here if Anthropic changes pricing or a spoke adopts a different model.
// Historical estimates always use whatever is in this table today, not the
// price at the time a given call was made.
export const PRICING: Record<string, ModelPricing> = {
  'claude-opus-4-5': { inputPerMTok: 5, outputPerMTok: 25 },
};

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number | null {
  const pricing = PRICING[model];
  if (!pricing) {
    return null;
  }
  return (
    (inputTokens / 1_000_000) * pricing.inputPerMTok +
    (outputTokens / 1_000_000) * pricing.outputPerMTok
  );
}
