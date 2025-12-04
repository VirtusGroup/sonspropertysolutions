// ALX Error Code System
// Used for AccuLynx integration error tracking and user support

export const ERROR_CODES = {
  // Contact Creation Errors (C = Contact)
  ALX_C001: 'ALX-C001', // Network/timeout error during contact creation
  ALX_C002: 'ALX-C002', // AccuLynx API rejected the contact
  ALX_C003: 'ALX-C003', // Contact created but profile update failed
  
  // Job/Order Sync Errors (J = Job)
  ALX_J001: 'ALX-J001', // Missing AccuLynx contact ID
  ALX_J002: 'ALX-J002', // Order not found in database
  ALX_J003: 'ALX-J003', // AccuLynx API rejected the job
  ALX_J004: 'ALX-J004', // Network/timeout error during job sync
  
  // Photo Upload Errors (P = Photo)
  ALX_P001: 'ALX-P001', // No photos found for order
  ALX_P002: 'ALX-P002', // Failed to download from Supabase storage
  ALX_P003: 'ALX-P003', // AccuLynx API rejected the photo upload
  ALX_P004: 'ALX-P004', // Partial upload - some photos failed
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Helper to get a user-friendly description for logging/debugging
export function getErrorDescription(code: ErrorCode): string {
  switch (code) {
    case ERROR_CODES.ALX_C001:
      return 'Contact creation failed - network error';
    case ERROR_CODES.ALX_C002:
      return 'Contact creation failed - API rejection';
    case ERROR_CODES.ALX_C003:
      return 'Contact creation failed - profile update failed';
    case ERROR_CODES.ALX_J001:
      return 'Job sync failed - no contact ID';
    case ERROR_CODES.ALX_J002:
      return 'Job sync failed - order not found';
    case ERROR_CODES.ALX_J003:
      return 'Job sync failed - API rejection';
    case ERROR_CODES.ALX_J004:
      return 'Job sync failed - network error';
    case ERROR_CODES.ALX_P001:
      return 'Photo upload failed - no photos found';
    case ERROR_CODES.ALX_P002:
      return 'Photo upload failed - storage download error';
    case ERROR_CODES.ALX_P003:
      return 'Photo upload failed - API rejection';
    case ERROR_CODES.ALX_P004:
      return 'Photo upload failed - partial upload';
    default:
      return 'Unknown error';
  }
}
