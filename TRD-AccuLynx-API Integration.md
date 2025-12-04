# Technical Requirements Document
## Sons Home Helper Mobile App

---

# Section 4: AccuLynx API Integration

## 4.1 Overview

This section defines the integration between the Sons Home Helper app and AccuLynx CRM. All service requests (orders) submitted through the app are synced to AccuLynx as jobs.

### Integration Principles

1. **AccuLynx is Source of Truth** — Once synced, AccuLynx manages job status, scheduling, and completion
2. **Contact-First Flow** — Contacts must exist before jobs can be created
3. **Async Processing** — Sync happens via edge functions, not blocking user submission
4. **Retry Logic** — Failed syncs retry automatically with backoff
5. **Audit Trail** — All webhook events logged to `webhook_logs` table

### APIs Used

| # | Endpoint | Purpose |
|---|----------|---------|
| 1 | POST /contacts | Create customer contact in AccuLynx |
| 2 | POST /jobs | Create job linked to contact |
| 3 | POST /jobs/{id}/files | Upload photos to job |

---

## 4.2 Hardcoded Reference IDs

These values are pulled from AccuLynx once and hardcoded in the app configuration.

### Configuration File: `src/config/acculynx.ts`

```typescript
/**
 * AccuLynx API Configuration
 * All reference IDs hardcoded from AccuLynx settings
 */

// API Base URL
export const ACCULYNX_API_BASE = 'https://api.acculynx.com/api/v2';

// Contact Type - Used when creating new contacts
export const ACCULYNX_CONTACT_TYPE_ID = '52ba94c5-3ecf-4e7f-90cd-a91de12a72f5'; // "Customer"

// Lead Source - Identifies leads from mobile app
export const ACCULYNX_SOURCE_ID = '4d3ff3bd-6685-45ba-8209-951b30adc9a6'; // "Mobile App"

// Trade Types - All available from AccuLynx
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

// Service ID → Trade Type mapping
export const SERVICE_TO_TRADE_TYPE: Record<string, string> = {
  // Gutter services → GUTTERS
  'svc-1':  ACCULYNX_TRADE_TYPES.GUTTERS,   // Gutter Cleaning
  'svc-6':  ACCULYNX_TRADE_TYPES.GUTTERS,   // Gutter Guard Installation
  'svc-10': ACCULYNX_TRADE_TYPES.GUTTERS,   // Downspout Extensions

  // Roofing services → ROOFING
  'svc-2':  ACCULYNX_TRADE_TYPES.ROOFING,   // Roof Inspection
  'svc-3':  ACCULYNX_TRADE_TYPES.ROOFING,   // Small Roof Repair
  'svc-4':  ACCULYNX_TRADE_TYPES.ROOFING,   // Emergency Roof Tarp
  'svc-8':  ACCULYNX_TRADE_TYPES.ROOFING,   // Chimney Flashing Repair

  // Maintenance services → REPAIR
  'svc-5':  ACCULYNX_TRADE_TYPES.REPAIR,    // Skylight Resealing
  'svc-7':  ACCULYNX_TRADE_TYPES.REPAIR,    // Roof Tune-Up
  'svc-9':  ACCULYNX_TRADE_TYPES.REPAIR,    // Roof Ventilation Upgrade
};

export function getTradeTypeId(serviceId: string): string {
  return SERVICE_TO_TRADE_TYPE[serviceId] || ACCULYNX_TRADE_TYPES.ROOFING;
}
```

---

## 4.3 Sync Flow

### State Machine

Orders progress through sync states stored in `orders.sync_status`:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SYNC STATE MACHINE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐                                          │
│  │  Order Created       │                                          │
│  │  (User submits)      │                                          │
│  └──────────┬───────────┘                                          │
│             │                                                       │
│             ▼                                                       │
│  ┌──────────────────────┐     ┌─────────────────────┐              │
│  │ pending_contact_     │────▶│ Contact exists?     │              │
│  │ creation             │     │ (acculynx_contact_id│              │
│  └──────────────────────┘     │  NOT NULL?)         │              │
│                               └──────────┬──────────┘              │
│                                          │                          │
│                         ┌────────────────┴────────────────┐        │
│                         │                                 │        │
│                         ▼ NO                              ▼ YES    │
│              ┌──────────────────┐              ┌─────────────────┐ │
│              │ POST /contacts   │              │ Skip to job     │ │
│              │ Create contact   │              │ creation        │ │
│              └────────┬─────────┘              └────────┬────────┘ │
│                       │                                 │          │
│                       │ Success                         │          │
│                       │ Store acculynx_contact_id       │          │
│                       │                                 │          │
│                       └────────────────┬────────────────┘          │
│                                        │                            │
│                                        ▼                            │
│                         ┌──────────────────────┐                   │
│                         │ pending_job_creation │                   │
│                         └──────────┬───────────┘                   │
│                                    │                                │
│                                    ▼                                │
│                         ┌──────────────────────┐                   │
│                         │ POST /jobs           │                   │
│                         │ Create job           │                   │
│                         └──────────┬───────────┘                   │
│                                    │                                │
│                                    │ Success                        │
│                                    │ Store acculynx_job_id          │
│                                    │                                │
│                                    ▼                                │
│                         ┌──────────────────────┐                   │
│                         │ Upload photos        │                   │
│                         │ POST /jobs/{id}/files│                   │
│                         └──────────┬───────────┘                   │
│                                    │                                │
│                                    ▼                                │
│                         ┌──────────────────────┐                   │
│                         │ submitted            │                   │
│                         │ (Sync complete)      │                   │
│                         └──────────────────────┘                   │
│                                                                     │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ERROR HANDLING ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│                                                                     │
│         ┌──────────────────────┐                                   │
│         │ Any step fails       │                                   │
│         └──────────┬───────────┘                                   │
│                    │                                                │
│                    ▼                                                │
│         ┌──────────────────────┐     ┌─────────────────────┐       │
│         │ sync_attempts < 3?   │────▶│ failed              │       │
│         └──────────┬───────────┘ NO  │ (will retry)        │       │
│                    │                 └─────────────────────┘       │
│                    │ YES                                            │
│                    ▼                                                │
│         ┌──────────────────────┐                                   │
│         │ requires_manual_     │                                   │
│         │ review               │                                   │
│         │ (Admin intervention) │                                   │
│         └──────────────────────┘                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4.4 API Specifications

### 4.4.1 POST /contacts — Create Contact

**When Called:** New customer with no existing `acculynx_contact_id`

**Endpoint:** `POST https://api.acculynx.com/api/v2/contacts`

**Request Mapping:**

| AccuLynx Field | Source | Notes |
|----------------|--------|-------|
| `firstName` | `orders.contact_first_name` | Required |
| `lastName` | `orders.contact_last_name` | Required |
| `contactTypeIds` | Hardcoded | `["52ba94c5-3ecf-4e7f-90cd-a91de12a72f5"]` (array) |
| `note` | Generated | `"Service request {job_ref}: {orders.notes}"` |
| `phoneNumbers[0].number` | `orders.contact_phone` | Required |
| `phoneNumbers[0].type` | Hardcoded | `"Mobile"` (from mobile app) |
| `Addresses[0].address` | `orders.contact_email` | Email address |
| `mailingAddress.street` | `addresses.street` | From joined address |
| `mailingAddress.city` | `addresses.city` | From joined address |
| `mailingAddress.state` | `addresses.state` | From joined address |
| `mailingAddress.zip` | `addresses.zip` | From joined address |

**Request Example:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "contactTypeIds": ["52ba94c5-3ecf-4e7f-90cd-a91de12a72f5"],
  "note": "Service request SR-10001: Leak in kitchen ceiling after recent storm.",
  "phoneNumbers": [
    {
      "number": "214-555-1234",
      "type": "Mobile"
    }
  ],
  "Addresses": [
    {
      "address": "john.smith@email.com"
    }
  ],
  "mailingAddress": {
    "street": "123 Main St",
    "city": "Dallas",
    "state": "TX",
    "zip": "75201"
  }
}
```

**Response Handling:**

| Response | Action |
|----------|--------|
| 201 Created | Store `response.id` → `orders.acculynx_contact_id` |
| 400 Bad Request | Log error, increment `sync_attempts` |
| 401 Unauthorized | Log error, alert admin (API key issue) |
| 409 Conflict | Contact may exist — search and link |

**After Success:**
```sql
UPDATE orders SET
  acculynx_contact_id = '{response.id}',
  sync_status = 'pending_job_creation',
  last_sync_at = NOW()
WHERE id = '{order_id}';
```

---

### 4.4.2 POST /jobs — Create Job

**When Called:** After contact exists (has `acculynx_contact_id`)

**Endpoint:** `POST https://api.acculynx.com/api/v2/jobs`

**Request Mapping:**

| AccuLynx Field | Source | Notes |
|----------------|--------|-------|
| `contact.id` | `orders.acculynx_contact_id` | Required — from previous step |
| `leadSource.id` | Hardcoded | `4d3ff3bd-6685-45ba-8209-951b30adc9a6` |
| `locationAddress.street1` | `addresses.street` | Required |
| `locationAddress.street2` | `addresses.unit` | Optional |
| `locationAddress.city` | `addresses.city` | Required |
| `locationAddress.state` | `addresses.state` | Required |
| `locationAddress.country` | Hardcoded | `"US"` |
| `locationAddress.zipCode` | `addresses.zip` | Required |
| `tradeTypes[0].id` | `getTradeTypeFromCategory(orders.service_category)` | **VARIES** — see mapping below |
| `notes` | Generated | `"Service request {job_ref}: {orders.notes}"` |

**Trade Type Mapping (category → tradeTypes[0].id):**

The `tradeTypes[0].id` value is determined by the **service category**, not the individual service ID. This allows new services to automatically map to the correct trade type based on their category.

| Category | tradeTypes[0].id | AccuLynx Trade Type |
|----------|------------------|---------------------|
| `gutters` | `991168f6-c6b3-4179-bd94-3b3e84551d9c` | Gutters |
| `roofing` | `63ed4a38-4bf6-429d-913b-365b043bb5e0` | Roofing |
| `maintenance` | `44a743a5-82c0-44b3-bc83-cfe05a8802e3` | Repair |
| `storm` | `63ed4a38-4bf6-429d-913b-365b043bb5e0` | Roofing |

**Implementation (`src/config/acculynx.ts`):**

```typescript
// Category → Trade Type mapping
export const CATEGORY_TO_TRADE_TYPE: Record<string, string> = {
  gutters:     ACCULYNX_TRADE_TYPES.GUTTERS,
  roofing:     ACCULYNX_TRADE_TYPES.ROOFING,
  maintenance: ACCULYNX_TRADE_TYPES.REPAIR,
  storm:       ACCULYNX_TRADE_TYPES.ROOFING,  // Storm services → Roofing
};

/**
 * Get AccuLynx trade type from service category
 * Now automatically syncs when category changes!
 */
export function getTradeTypeFromCategory(category: string): string {
  const tradeTypeId = CATEGORY_TO_TRADE_TYPE[category];

  if (!tradeTypeId) {
    console.error(`Missing AccuLynx trade type mapping for category: ${category}`);
    return ACCULYNX_TRADE_TYPES.ROOFING; // Fallback
  }

  return tradeTypeId;
}
```

**Current Services by Category:**

| Category | Services |
|----------|----------|
| `gutters` | Gutter Cleaning, Gutter Guard Installation, Downspout Extensions |
| `roofing` | Roof Inspection, Small Roof Repair, Emergency Roof Tarp, Chimney Flashing Repair |
| `maintenance` | Skylight Resealing, Roof Tune-Up, Roof Ventilation Upgrade |
| `storm` | Emergency Roof Tarp |

**Adding New Services:**

When adding a new service to `demoData.ts`, simply assign the correct `category` and the trade type mapping happens automatically:

```typescript
// Example: Adding a new gutter service
{
  id: 'svc-11',
  category: 'gutters',  // ← Automatically maps to GUTTERS trade type
  title: 'Gutter Repair',
  // ...
}
```

**Request Example:**

```json
{
  "contact": {
    "id": "{acculynx_contact_id}"
  },
  "leadSource": {
    "id": "4d3ff3bd-6685-45ba-8209-951b30adc9a6"
  },
  "locationAddress": {
    "street1": "123 Main St",
    "street2": "",
    "city": "Dallas",
    "state": "TX",
    "country": "US",
    "zipCode": "75201"
  },
  "tradeTypes": [
    {
      "id": "63ed4a38-4bf6-429d-913b-365b043bb5e0"
    }
  ],
  "notes": "Service request SR-10001: Leak in kitchen ceiling after recent storm."
}
```

> **Note:** The `tradeTypes[0].id` in the example above uses the Roofing trade type. In production, this value will be dynamically selected based on the `service_id` from the order using the `getTradeTypeId()` function defined in `src/config/acculynx.ts`.

---

### 4.4.3 POST /jobs/{jobId}/photos-videos — Upload Photo

**When Called:** Immediately after job is successfully created in AccuLynx (has `acculynx_job_id`)

**Endpoint:** `POST https://api.acculynx.com/api/v2/jobs/{jobId}/photos-videos`

**Content-Type:** `multipart/form-data`

**Process Flow:**

```
Job created successfully (acculynx_job_id stored)
              │
              ▼
   Query order_photos for this order
   WHERE uploaded_to_acculynx = false
              │
              ▼
   For each photo:
   ┌─────────────────────────────────┐
   │ 1. Fetch file from Supabase    │
   │    Storage using storage_path   │
   │                                 │
   │ 2. POST to AccuLynx API        │
   │    - file: binary data          │
   │    - description: generated     │
   │                                 │
   │ 3. On success:                  │
   │    - uploaded_to_acculynx=true  │
   │    - store acculynx_file_id     │
   │                                 │
   │ 4. On failure:                  │
   │    - Log error                  │
   │    - Continue to next photo     │
   └─────────────────────────────────┘
              │
              ▼
   All photos processed
   sync_status = 'submitted'
```

**Request Mapping:**

| AccuLynx Field | Source | Notes |
|----------------|--------|-------|
| `{jobId}` (path) | `orders.acculynx_job_id` | Required — from job creation |
| `file` | Supabase Storage | Fetch from `order_photos.storage_path` |
| `description` | Generated | `"Photo from service request {job_ref}"` |

**Storage Path Format:**
```
{user_id}/{order_id}/{filename}.{ext}
Example: e47d7bb6-1234-5678/abc-order-id/1764739829140-m4w2lo.png
```

**Request Example (multipart/form-data):**

```
POST /api/v2/jobs/719e3bf8-17b5-4d4f-8aba-451e370f83f8/photos-videos
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="roof-damage.jpg"
Content-Type: image/jpeg

[binary data]
--boundary
Content-Disposition: form-data; name="description"

Photo from service request SR-10001
--boundary--
```

**Response Handling:**

| Response | Action |
|----------|--------|
| 202 Accepted | Mark photo as uploaded (see below) |
| 400 Bad Request | Log error, skip photo |
| 401 Unauthorized | Log error, alert admin |
| 404 Not Found | Job doesn't exist — log error |

**After Success (per photo):**
```sql
UPDATE order_photos SET
  uploaded_to_acculynx = true,
  acculynx_file_id = '{response.id}'
WHERE id = '{photo_id}';
```

**After All Photos Processed:**
```sql
UPDATE orders SET
  sync_status = 'submitted',
  last_sync_at = NOW()
WHERE id = '{order_id}';
```

**Edge Function Logic:**

```typescript
async function uploadPhotosToAccuLynx(orderId: string, jobId: string, jobRef: string) {
  // 1. Get all photos not yet uploaded
  const { data: photos } = await supabase
    .from('order_photos')
    .select('*')
    .eq('order_id', orderId)
    .eq('uploaded_to_acculynx', false);

  if (!photos || photos.length === 0) {
    return { success: true, uploaded: 0 };
  }

  let uploadedCount = 0;

  // 2. Upload each photo
  for (const photo of photos) {
    try {
      // Fetch file from Supabase Storage
      const { data: fileData } = await supabase.storage
        .from('service-request-photos')
        .download(photo.storage_path);

      // Create form data
      const formData = new FormData();
      formData.append('file', fileData, photo.file_name);
      formData.append('description', `Photo from service request ${jobRef}`);

      // Upload to AccuLynx
      const response = await fetch(
        `${ACCULYNX_API_BASE}/jobs/${jobId}/photos-videos`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCULYNX_API_KEY}`,
          },
          body: formData,
        }
      );

      if (response.status === 202) {
        // Mark as uploaded
        await supabase
          .from('order_photos')
          .update({ 
            uploaded_to_acculynx: true,
            // acculynx_file_id: response.id (if returned)
          })
          .eq('id', photo.id);

        uploadedCount++;
      }
    } catch (error) {
      console.error(`Failed to upload photo ${photo.id}:`, error);
      // Continue to next photo
    }
  }

  return { success: true, uploaded: uploadedCount };
}
```

**Supported File Types (from AccuLynx):**

Images:
- `.jpg`, `.jpeg`, `.jpe`, `.jfif`
- `.png`
- `.gif`
- `.heic`, `.heif`
- `.tif`, `.tiff`
- `.bmp`, `.dib`
- `.webp`
- `.ico`
- `.pct`, `.pict`, `.pic`
- `.mac`, `.pbm`, `.pgm`, `.ppm`, `.pnm`
- `.ras`, `.rgb`, `.xbm`, `.xpm`, `.xwd`

Videos (if supported in app):
- `.mp4`, `.m4v`, `.mp4v`
- `.mov`, `.movie`
- `.avi`
- `.mkv`
- `.flv`, `.f4v`
- `.wmv`, `.wm`, `.wmx`
- `.mpeg`, `.mpg`, `.mpe`, `.mpa`
- `.3gp`, `.3g2`, `.3gp2`, `.3gpp`

**Frontend File Input:**
```html
<!-- Current (photos only) -->
<input 
  type="file" 
  accept="image/*"
  multiple
/>

<!-- Future (photos + videos) -->
<input 
  type="file" 
  accept="image/*,video/*"
  multiple
/>
```

**Validation (Edge Function):**
```typescript
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 
  'image/heic', 'image/heif', 'image/webp',
  'image/tiff', 'image/bmp'
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4', 'video/quicktime', 'video/x-msvideo',
  'video/x-matroska', 'video/x-flv', 'video/x-ms-wmv'
];

function isValidFileType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType) 
      || ALLOWED_VIDEO_TYPES.includes(mimeType);
}
```
```

**Response Handling:**

| Response | Action |
|----------|--------|
| 201 Created | Store `response.id` → `orders.acculynx_job_id` |
| 400 Bad Request | Log error, increment `sync_attempts` |
| 401 Unauthorized | Log error, alert admin |

**After Success:**
```sql
UPDATE orders SET
  acculynx_job_id = '{response.id}',
  sync_status = 'submitted',
  last_sync_at = NOW()
WHERE id = '{order_id}';
```

---

## 4.5 Complete Sync Flow

The complete sync flow after order creation:

### Function: `sync-order-to-acculynx`

**Trigger:** Called after order creation OR by retry scheduler

**Location:** `supabase/functions/sync-order-to-acculynx/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ACCULYNX_API_BASE = 'https://api.acculynx.com/api/v2';
const ACCULYNX_API_KEY = Deno.env.get('ACCULYNX_API_KEY');

// Hardcoded reference IDs
const CONTACT_TYPE_ID = '52ba94c5-3ecf-4e7f-90cd-a91de12a72f5';
const SOURCE_ID = '4d3ff3bd-6685-45ba-8209-951b30adc9a6';

const TRADE_TYPES = {
  SIDING:     '543b24fd-3329-499d-984c-148e14302725',
  ROOFING:    '63ed4a38-4bf6-429d-913b-365b043bb5e0',
  GUTTERS:    '991168f6-c6b3-4179-bd94-3b3e84551d9c',
  HVAC:       '9cb7a2a0-3a2f-4416-9a78-606124f99e45',
  WINDOWS:    '05d2f264-7f55-4e8a-88b8-772e0b8070c7',
  INTERIOR:   'd2f8b833-0250-4d6e-901d-77a14ae3355a',
  INSULATION: '6bbb47bc-9523-451b-a0c2-aa45d787546b',
  REPAIR:     '44a743a5-82c0-44b3-bc83-cfe05a8802e3',
  PAINTING:   '97c24fc5-3a36-4aed-8f0a-e3b8bd373ce3',
};

const SERVICE_TO_TRADE_TYPE: Record<string, string> = {
  'gutters':     TRADE_TYPES.GUTTERS,
  'roofing':     TRADE_TYPES.ROOFING,
  'maintenance': TRADE_TYPES.REPAIR,
  'storm':       TRADE_TYPES.ROOFING,
};

serve(async (req) => {
  const { orderId } = await req.json();
  
  // Implementation follows sync flow from Section 4.3
  // 1. Check if contact exists
  // 2. Create contact if needed
  // 3. Create job
  // 4. Upload photos
  // 5. Update sync_status
});
```

---

## 4.6 Retry Logic

### Automatic Retry

Failed syncs are retried automatically:

| Attempt | Delay | Action |
|---------|-------|--------|
| 1 | Immediate | First attempt on order creation |
| 2 | 5 minutes | Scheduled retry |
| 3 | 30 minutes | Scheduled retry |
| 4+ | — | Mark `requires_manual_review` |

### Retry Scheduler

**Function:** `retry-failed-syncs`
**Schedule:** Every 5 minutes (cron)

```sql
-- Find orders needing retry
SELECT * FROM orders
WHERE sync_status IN ('pending_contact_creation', 'pending_job_creation', 'failed')
  AND sync_attempts < 3
  AND (last_sync_at IS NULL OR last_sync_at < NOW() - INTERVAL '5 minutes');
```

---

## 4.7 Error Handling

### Error Logging

All errors stored in `orders` table:

```sql
UPDATE orders SET
  sync_attempts = sync_attempts + 1,
  last_sync_error = '{error_message}',
  last_sync_at = NOW(),
  sync_status = CASE 
    WHEN sync_attempts >= 3 THEN 'requires_manual_review'
    ELSE 'failed'
  END
WHERE id = '{order_id}';
```

### Error Types

| Error | Cause | Resolution |
|-------|-------|------------|
| 401 Unauthorized | Invalid API key | Check `ACCULYNX_API_KEY` env var |
| 400 Bad Request | Invalid data | Review request payload |
| 404 Not Found | Contact/Job doesn't exist | Re-sync from beginning |
| 500 Server Error | AccuLynx down | Retry later |
| Network Error | Connection failed | Retry later |

---

## 4.8 Environment Variables

Required in Supabase Edge Functions:

| Variable | Description |
|----------|-------------|
| `ACCULYNX_API_KEY` | AccuLynx API key for authentication |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for DB access |

---

## 4.9 Database Fields Reference

From `orders` table (Section 2):

| Column | Type | Purpose |
|--------|------|---------|
| `sync_status` | TEXT | Current sync state |
| `acculynx_contact_id` | TEXT | AccuLynx contact UUID |
| `acculynx_job_id` | TEXT | AccuLynx job UUID |
| `sync_attempts` | INTEGER | Retry counter |
| `last_sync_error` | TEXT | Last error message |
| `last_sync_at` | TIMESTAMPTZ | Last sync attempt |

From `order_photos` table:

| Column | Type | Purpose |
|--------|------|---------|
| `uploaded_to_acculynx` | BOOLEAN | Photo sync flag |
| `acculynx_file_id` | TEXT | AccuLynx file UUID |

---

## 4.10 Testing Checklist

- [ ] Create contact succeeds with valid data
- [ ] Create contact handles duplicate email gracefully
- [ ] Create job succeeds with valid contact
- [ ] Photo upload succeeds for each photo
- [ ] Retry logic triggers after failure
- [ ] `requires_manual_review` set after 3 failures
- [ ] All trade types map correctly
- [ ] Webhook logs capture all API calls

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 3, 2025 | VRTS Labs | Initial AccuLynx integration spec |

---

**Next Section:** [Section 5: Webhook Specifications →]


Code	Area	Description	When it occurs
ALX-C001	Contact	Contact creation failed - network error	create-acculynx-contact network/timeout
ALX-C002	Contact	Contact creation failed - API rejection	AccuLynx API returns error response
ALX-C003	Contact	Contact creation failed - profile update failed	Contact created but Supabase profile not updated
ALX-J001	Job	Job sync failed - no contact ID	User missing acculynx_contact_id
ALX-J002	Job	Job sync failed - order not found	Order ID doesn't exist in database
ALX-J003	Job	Job sync failed - API rejection	AccuLynx API returns error response
ALX-J004	Job	Job sync failed - network error	Network/timeout issue
ALX-P001	Photo	Photo upload failed - no photos found	No photos in database for order
ALX-P002	Photo	Photo upload failed - storage download error	Can't download from Supabase storage
ALX-P003	Photo	Photo upload failed - API rejection	AccuLynx API returns error response
ALX-P004	Photo	Photo upload failed - partial upload
