import {
  BRAND_TIERS, CATEGORY_BASE_VALUES, CONDITION_FACTORS, FAIR_SWAP_RATIO, TIER_MULTIPLIERS,
} from '../constants.js';
import { badRequest } from '../errors.js';

const norm = (s) => (s || '').toLowerCase().replace(/[\u2019`]/g, "'").trim();

export function brandTier(brand) {
  const b = norm(brand);
  if (BRAND_TIERS.fast.includes(b)) return 'fast';
  if (BRAND_TIERS.premium.includes(b)) return 'premium';
  return 'standard';
}

// Estimated value = base category value x brand tier multiplier x condition factor
export function calculateValue({ category, brand, condition }) {
  const baseValue = CATEGORY_BASE_VALUES[category];
  const conditionFactor = CONDITION_FACTORS[condition];
  if (baseValue === undefined) throw badRequest(`Unknown category: ${category}`);
  if (conditionFactor === undefined) throw badRequest(`Unknown condition: ${condition}`);
  const tier = brandTier(brand);
  const brandMultiplier = TIER_MULTIPLIERS[tier];
  return {
    estimatedValue: Math.max(1, Math.round(baseValue * brandMultiplier * conditionFactor)),
    breakdown: { baseValue, brandTier: tier, brandMultiplier, conditionFactor },
  };
}

export function compareValues(offered, target) {
  const hi = Math.max(offered, target);
  const lo = Math.min(offered, target);
  return {
    offered,
    target,
    difference: offered - target,
    fair: lo > 0 && hi / lo <= FAIR_SWAP_RATIO,
  };
}
