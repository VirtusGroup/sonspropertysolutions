import { EstimateInput, Service } from '@/types';

const ROOF_TYPE_MULTIPLIERS: Record<string, number> = {
  asphalt: 1.0,
  metal: 1.15,
  tile: 1.25,
  slate: 1.4,
};

const STORY_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.3,
  3: 1.6,
};

export function estimatePrice(input: EstimateInput): [number, number] {
  const { service, quantity = 1, roofType = 'asphalt', stories = 1, addonIds } = input;
  
  let baseAmount = service.basePrice;

  // Apply quantity for per-unit services
  if (service.unit !== 'fixed') {
    baseAmount *= quantity;
  }

  // Apply roof type multiplier if applicable
  if (service.category === 'roofing' && roofType) {
    const multiplier = ROOF_TYPE_MULTIPLIERS[roofType] || 1.0;
    baseAmount *= multiplier;
  }

  // Apply story multiplier
  const storyMultiplier = STORY_MULTIPLIERS[stories] || 1.0;
  baseAmount *= storyMultiplier;

  // Add addon costs
  const addonTotal = addonIds.reduce((sum, addonId) => {
    const addon = service.addons.find(a => a.id === addonId);
    return sum + (addon?.price || 0);
  }, 0);

  const subtotal = baseAmount + addonTotal;

  // Add variance range (±12%)
  const variancePercent = 0.12;
  const low = Math.round(subtotal * (1 - variancePercent));
  const high = Math.round(subtotal * (1 + variancePercent));

  return [low, high];
}
