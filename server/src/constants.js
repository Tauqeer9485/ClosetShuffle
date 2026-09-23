export const CATEGORIES = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 'Dresses', 'Ethnic Wear'];
export const CONDITIONS = ['New with tags', 'Like New', 'Good', 'Fair'];

export const LISTING_STATUS = { AVAILABLE: 'AVAILABLE', PENDING_SWAP: 'PENDING_SWAP', SWAPPED: 'SWAPPED' };
export const SWAP_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};
export const ROLES = { USER: 'user', ADMIN: 'admin' };

// Swap value = base category value x brand tier multiplier x condition factor (in "swap points")
export const CATEGORY_BASE_VALUES = {
  Tops: 20,
  Bottoms: 25,
  Outerwear: 60,
  Shoes: 40,
  Accessories: 15,
  Dresses: 35,
  'Ethnic Wear': 40,
};
export const TIER_MULTIPLIERS = { fast: 0.8, standard: 1.0, premium: 1.8 };
export const CONDITION_FACTORS = {
  'New with tags': 1.0,
  'Like New': 0.85,
  Good: 0.65,
  Fair: 0.45,
};
// Lowercase brand names. Anything not listed is "standard". Edit freely.
export const BRAND_TIERS = {
  fast: ['h&m', 'shein', 'forever 21', 'max', 'pantaloons', 'roadster', 'zudio'],
  premium: [
    'nike', 'adidas', 'puma', "levi's", 'levis', 'tommy hilfiger', 'calvin klein',
    'ralph lauren', 'ray-ban', 'gucci', 'prada', 'burberry', 'the north face', 'patagonia',
  ],
};
// A swap is "fair" when the two values are within this ratio of each other
export const FAIR_SWAP_RATIO = 1.25;
