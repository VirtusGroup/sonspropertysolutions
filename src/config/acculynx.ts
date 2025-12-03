/**
 * AccuLynx API Configuration
 * 
 * Trade types are mapped by SERVICE CATEGORY, not service ID.
 * This ensures automatic sync when a service's category changes in demoData.ts.
 */

import type { ServiceCategory } from '@/types';

// All AccuLynx Trade Types (from GET /tradetypes)
export const ACCULYNX_TRADE_TYPES = {
  SIDING:     '543b24fd-3329-499d-984c-148e14302725',
  ROOFING:    '63ed4a38-4bf6-429d-913b-365b043bb5e0',
  GUTTERS:    '991168f6-c6b3-4179-bd94-3b3e84551d9c',
  HVAC:       '9cb7a2a0-3a2f-4416-9a78-606124f99e45',
  WINDOWS:    '05d2f264-7f55-4e8a-88b8-772e0b8070c7',
  INTERIOR:   'd2f8b833-0250-4d6e-901d-77a14ae3355a',
  INSULATION: '6bbb47bc-9523-451b-a0c2-aa45d787546b',
  REPAIR:     '44a743a5-82c0-44b3-bc83-cfe05a8802e3',
  PAINTING:   '97c24fc5-3a36-4aed-8f0a-e3b8bd373ce3',
} as const;

// Service Category → AccuLynx Trade Type mapping
// Update this ONLY when adding a new category to ServiceCategory type
export const CATEGORY_TO_TRADE_TYPE: Record<ServiceCategory, string> = {
  gutters:     ACCULYNX_TRADE_TYPES.GUTTERS,
  roofing:     ACCULYNX_TRADE_TYPES.ROOFING,
  maintenance: ACCULYNX_TRADE_TYPES.REPAIR,
  storm:       ACCULYNX_TRADE_TYPES.ROOFING,
};

/**
 * Get AccuLynx trade type ID from service category
 * @param category - The service category from demoData.ts
 * @returns AccuLynx trade type UUID
 */
export function getTradeTypeFromCategory(category: ServiceCategory): string {
  const tradeTypeId = CATEGORY_TO_TRADE_TYPE[category];
  
  if (!tradeTypeId) {
    console.error(`Missing AccuLynx trade type mapping for category: ${category}`);
    return ACCULYNX_TRADE_TYPES.ROOFING; // Fallback
  }
  
  return tradeTypeId;
}

/**
 * Validate all categories have trade type mappings
 * Call this during app initialization in development
 */
export function validateCategoryMappings(services: { category: ServiceCategory; title: string }[]): void {
  const categories = [...new Set(services.map(s => s.category))];
  const missingMappings = categories.filter(c => !CATEGORY_TO_TRADE_TYPE[c]);
  
  if (missingMappings.length > 0) {
    console.warn(
      'Categories missing AccuLynx trade type mappings:',
      missingMappings.join(', ')
    );
  }
}
