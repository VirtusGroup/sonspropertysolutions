# Sons Property Solutions - Mobile App Prototype

A polished mobile-first PWA for booking roofing and property services in the Dallas-Fort Worth area.

## Overview

This is a **prototype application** demonstrating a consumer marketplace-style app for Sons Property Solutions (Sons Roofing). It features a complete booking flow, order tracking, and user profile management - all without requiring backend infrastructure.

### ⚠️ Prototype Limitations

- **No real backend**: All data stored in localStorage
- **No payment processing**: Payment UI is placeholder-only
- **No external integrations**: No Aculinks, QuickBooks, or live APIs
- **Demo authentication**: Sign-in is simulated for testing flows
- **Static estimates**: Pricing uses client-side formulas only

## Features

### ✅ Complete User Flows
- **Service Catalog**: Browse 10+ services with filtering and search
- **Smart Estimator**: Get instant price estimates based on property details
- **5-Step Booking**: Service → Address → Photos → Schedule → Review
- **Order Tracking**: View status timeline from Received → Completed
- **User Profiles**: Manage addresses, notifications, referral codes
- **PWA Support**: Install to home screen on iOS/Android

### 🎨 Design System
- Professional navy primary (#2B4056) + warm amber accent
- Mobile-first responsive layouts
- Smooth transitions and animations
- Bottom tab navigation for easy thumb access
- Semantic color tokens (no hardcoded colors)

### 🛠️ Dev Features
- **Dev Menu** (kebab menu in header):
  - Reset demo data
  - Impersonate users (Guest, Regular, VIP)
  - Advance order status
  - Toggle promotions

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:8080`

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand with localStorage persistence
- **Forms**: react-hook-form + zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Routes

- `/` - Home with hero, promos, popular services
- `/services` - Service catalog with filters
- `/services/:slug` - Service detail with estimator
- `/book` - Multi-step booking wizard
- `/orders` - Order list
- `/orders/:id` - Order detail with timeline
- `/account` - User profile and settings
- `/support` - Contact options and FAQs
- `/install` - PWA installation guide

## Demo Data

The app includes seeded data:
- 10 services across 4 categories
- 3 user personas (Guest, Returning Customer, VIP)
- 4 sample orders at various stages
- 3 active promotions

## Packaging for Despia (Native Apps)

### Key Considerations
1. **Safe Areas**: CSS already includes `safe-area-inset-*` support
2. **No SSR**: All rendering is client-side
3. **Deep Links**: Routes support direct navigation (`/orders/:id`, etc.)
4. **Status Bar**: Theme color set to brand navy (#2B4056)
5. **Viewport**: Prevents zoom on inputs with proper font sizing

### Testing Checklist
- [ ] Bottom tabs accessible on all devices
- [ ] Photo upload works with camera on mobile
- [ ] Forms don't trigger zoom on iOS
- [ ] Safe areas respected (notches, home indicators)
- [ ] Status bar color matches brand

## Known Limitations

1. **Photos**: Stored as base64 in localStorage (no real upload)
2. **Payments**: All payment UI disabled with tooltips
3. **Push Notifications**: Toggle present but non-functional
4. **Real-time Updates**: No live order status changes
5. **Backend Validation**: All validation is client-side only

## Future Enhancements (Not in Prototype)

- Real backend with Supabase/Firebase
- Stripe payment integration
- SMS notifications via Twilio
- Google Maps for service area
- Live chat support
- In-app reviews and ratings

## License

Prototype for demonstration purposes.
