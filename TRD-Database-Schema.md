# Technical Requirements Document
## Sons Home Helper Mobile App

**Client:** Sons Roofing  
**Document Owner:** VRTS Labs  
**Version:** 1.0 Draft  
**Last Updated:** December 2, 2025  

---

# Section 2: Database Schema

## 2.1 Overview

This document defines the Supabase PostgreSQL database schema for the Sons Home Helper mobile app. The schema follows a **foundation-up approach** where all subsequent technical specifications (APIs, webhooks, edge functions) reference these table definitions.

### Design Principles

1. **Supabase Auth Integration** - User authentication handled by Supabase Auth; `profiles` table extends auth.users
2. **Required Authentication** - All service requests require a registered user (no guest checkout)
3. **Frontend-Static Services** - Service catalog is hardcoded in frontend; `service_id` stored as text reference
4. **AccuLynx Sync Ready** - Schema includes fields for AccuLynx CRM integration and sync status tracking
5. **Mobile-First** - Optimized for fast queries on mobile devices

### Tech Stack

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |
| File Storage | Supabase Storage |
| Real-time | Supabase Realtime (subscriptions) |
| Edge Functions | Supabase Edge Functions (Deno) |

---

## 2.2 Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────┐                                                            │
│  │   auth.users    │  (Supabase managed)                                        │
│  │─────────────────│                                                            │
│  │ id (uuid)       │──────────────────────┐                                     │
│  │ email           │                      │                                     │
│  │ created_at      │                      │                                     │
│  └─────────────────┘                      │                                     │
│                                           │                                     │
│                                           ▼                                     │
│  ┌─────────────────┐       ┌─────────────────────┐       ┌──────────────────┐  │
│  │    profiles     │       │      addresses      │       │ orders │  │
│  │─────────────────│       │─────────────────────│       │──────────────────│  │
│  │ id (FK auth)    │◄──────│ user_id (FK)        │       │ id               │  │
│  │ first_name      │       │ id                  │◄──────│ address_id (FK)  │  │
│  │ last_name       │       │ label               │       │ user_id (FK)     │──┘
│  │ email           │       │ street              │       │ service_id       │
│  │ phone           │       │ unit                │       │ job_ref          │
│  │ referral_code   │       │ city                │       │ status           │
│  │ credits         │       │ state               │       │ sync_status      │
│  │ push_enabled    │       │ zip                 │       │ acculynx_job_id  │
│  │ email_enabled   │       │ property_type       │       │ acculynx_contact │
│  │ terms_accepted  │       │ is_default          │       │ ...              │
│  └─────────────────┘       └─────────────────────┘       └──────────────────┘
│          │                                                        │
│          │                                                        │
│          ▼                                                        ▼
│  ┌─────────────────┐                                    ┌──────────────────┐
│  │  user_devices   │                                    │ service_request_ │
│  │─────────────────│                                    │ photos           │
│  │ id              │                                    │──────────────────│
│  │ user_id (FK)    │                                    │ id               │
│  │ fcm_token       │                                    │ service_request_ │
│  │ platform        │                                    │   id (FK)        │
│  │ device_name     │                                    │ storage_path     │
│  │ is_active       │                                    │ file_name        │
│  └─────────────────┘                                    │ caption          │
│                                                         │ uploaded_to_     │
│                                                         │   acculynx       │
│          ┌──────────────────┐                           └──────────────────┘
│          │  notifications   │
│          │──────────────────│                           ┌──────────────────┐
│          │ id               │                           │   webhook_logs   │
│          │ user_id (FK)     │                           │──────────────────│
│          │ service_request_ │                           │ id               │
│          │   id (FK)        │                           │ source           │
│          │ title            │                           │ event_type       │
│          │ message          │                           │ payload (JSONB)  │
│          │ type             │                           │ service_request_ │
│          │ read             │                           │   id (FK)        │
│          └──────────────────┘                           │ processed        │
│                                                         │ error_message    │
│                                                         └──────────────────┘
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2.3 Enum Definitions

### property_type
Defines the type of property for addresses and service requests.

```sql
CREATE TYPE property_type AS ENUM (
  'residential',
  'commercial'
);
```

| Value | Description |
|-------|-------------|
| `residential` | Single-family homes, townhomes, condos |
| `commercial` | Business properties, multi-unit buildings |

---

### order_status
Tracks the lifecycle of a service request from submission to completion.

```sql
CREATE TYPE order_status AS ENUM (
  'received',
  'scheduled',
  'in_progress',
  'job_complete',
  'finished',
  'cancelled'
);
```

| Value | Description | Trigger |
|-------|-------------|---------|
| `received` | Request submitted by customer | Initial submission |
| `scheduled` | Appointment date confirmed | Admin/AccuLynx update |
| `in_progress` | Work has begun | Field crew update |
| `job_complete` | Work finished, pending final review | Field crew update |
| `finished` | Fully closed out | Admin confirmation |
| `cancelled` | Request cancelled | Customer or admin action |

---

### sync_status
Tracks AccuLynx synchronization state for service requests.

```sql
CREATE TYPE sync_status AS ENUM (
  'pending_contact_creation',
  'pending_job_creation',
  'submitted',
  'failed',
  'requires_manual_review'
);
```

| Value | Description | Next Action |
|-------|-------------|-------------|
| `pending_contact_creation` | Contact needs to be created in AccuLynx | Edge function creates contact |
| `pending_job_creation` | Contact exists, job needs to be created | Edge function creates job |
| `submitted` | Successfully synced to AccuLynx | No action needed |
| `failed` | Sync failed (will retry) | Automatic retry |
| `requires_manual_review` | Failed after max retries | Admin intervention required |

---

### notification_type
Categorizes notifications for filtering and display.

```sql
CREATE TYPE notification_type AS ENUM (
  'order',
  'system'
);
```

| Value | Description |
|-------|-------------|
| `order` | Related to a service request (status update, scheduling) |
| `system` | General system notifications (promos, announcements) |

---

### device_platform
Identifies the mobile platform for push notifications.

```sql
CREATE TYPE device_platform AS ENUM (
  'ios',
  'android',
  'web'
);
```

---

## 2.4 Table Definitions

### profiles
Extends Supabase `auth.users` with application-specific user data.

```sql
CREATE TABLE profiles (
  -- Primary Key (matches auth.users.id)
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT NOT NULL,
  
  -- Loyalty Program
  referral_code   TEXT UNIQUE NOT NULL,
  credits         INTEGER DEFAULT 0,
  
  -- Notification Preferences
  push_enabled    BOOLEAN DEFAULT true,
  email_enabled   BOOLEAN DEFAULT true,
  
  -- Legal
  terms_accepted_at TIMESTAMPTZ,
  
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | - | FK to auth.users.id |
| first_name | TEXT | NO | - | User's first name |
| last_name | TEXT | NO | - | User's last name |
| email | TEXT | NO | - | User's email (unique) |
| phone | TEXT | NO | - | User's phone number |
| referral_code | TEXT | NO | - | Unique referral code (e.g., "JOHN1234") |
| credits | INTEGER | NO | 0 | Referral credits balance |
| push_enabled | BOOLEAN | NO | true | Push notification preference |
| email_enabled | BOOLEAN | NO | true | Email notification preference |
| terms_accepted_at | TIMESTAMPTZ | YES | - | Timestamp of terms acceptance |
| created_at | TIMESTAMPTZ | NO | NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NO | NOW() | Last update timestamp |

**Referral Code Generation Logic:**
```
[FIRST_NAME_CAPS(1-4 chars)] + [RANDOM_4_DIGITS]
Example: "JOHN4829"
```

---

### addresses
Stores user addresses for service requests.

```sql
CREATE TABLE addresses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Address Details
  label           TEXT NOT NULL,
  street          TEXT NOT NULL,
  unit            TEXT,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  zip             TEXT NOT NULL,
  
  -- Property Info
  property_type   property_type NOT NULL,
  
  -- Settings
  is_default      BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_is_default ON addresses(user_id, is_default) WHERE is_default = true;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| user_id | UUID | NO | - | FK to profiles.id |
| label | TEXT | NO | - | User-friendly name (e.g., "Home", "Office") |
| street | TEXT | NO | - | Street address |
| unit | TEXT | YES | - | Apt/Suite/Unit number |
| city | TEXT | NO | - | City |
| state | TEXT | NO | - | State (2-letter code) |
| zip | TEXT | NO | - | ZIP code |
| property_type | property_type | NO | - | residential or commercial |
| is_default | BOOLEAN | NO | false | Is this the default address |
| created_at | TIMESTAMPTZ | NO | NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NO | NOW() | Last update timestamp |

**Business Rules:**
- Each user can have multiple addresses
- Only one address per user can be `is_default = true`
- First address added automatically becomes default

---

### orders
Core table storing all customer service requests (orders).

```sql
CREATE TABLE orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference
  job_ref               TEXT UNIQUE NOT NULL,
  
  -- Relationships
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  address_id            UUID NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
  
  -- Service Info (references frontend static data)
  service_id            TEXT NOT NULL,
  service_category      TEXT NOT NULL,
  
  -- Property Details
  property_type         property_type NOT NULL,
  quantity              INTEGER,
  roof_type             TEXT,
  stories               INTEGER,
  
  -- Contact Override (if different from profile)
  contact_first_name    TEXT NOT NULL,
  contact_last_name     TEXT NOT NULL,
  contact_email         TEXT NOT NULL,
  contact_phone         TEXT NOT NULL,
  
  -- Scheduling
  preferred_window      TEXT,
  scheduled_at          TIMESTAMPTZ,
  
  -- Request Details
  notes                 TEXT,
  estimate_low          INTEGER,
  estimate_high         INTEGER,
  
  -- Status Tracking
  status                order_status DEFAULT 'received',
  
  -- AccuLynx Integration
  sync_status           sync_status DEFAULT 'pending_contact_creation',
  acculynx_contact_id   TEXT,
  acculynx_job_id       TEXT,
  sync_attempts         INTEGER DEFAULT 0,
  last_sync_error       TEXT,
  last_sync_at          TIMESTAMPTZ,
  
  -- Timestamps
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  completed_at          TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_sync_status ON orders(sync_status);
CREATE INDEX idx_orders_job_ref ON orders(job_ref);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| job_ref | TEXT | NO | - | Unique job reference (e.g., "SR-10001") |
| user_id | UUID | NO | - | FK to profiles.id |
| address_id | UUID | NO | - | FK to addresses.id |
| service_id | TEXT | NO | - | References frontend service ID |
| service_category | TEXT | NO | - | Category: roofing, gutters, maintenance, storm |
| property_type | property_type | NO | - | residential or commercial |
| quantity | INTEGER | YES | - | Service-specific quantity |
| roof_type | TEXT | YES | - | Type of roof (if applicable) |
| stories | INTEGER | YES | - | Number of stories (if applicable) |
| contact_first_name | TEXT | NO | - | Contact first name for this request |
| contact_last_name | TEXT | NO | - | Contact last name for this request |
| contact_email | TEXT | NO | - | Contact email for this request |
| contact_phone | TEXT | NO | - | Contact phone for this request |
| preferred_window | TEXT | YES | - | Preferred scheduling window |
| scheduled_at | TIMESTAMPTZ | YES | - | Confirmed appointment datetime |
| notes | TEXT | YES | - | Customer notes/description |
| estimate_low | INTEGER | YES | - | Low end of estimate range (cents) |
| estimate_high | INTEGER | YES | - | High end of estimate range (cents) |
| status | order_status | NO | 'received' | Current request status |
| sync_status | sync_status | NO | 'pending_contact_creation' | AccuLynx sync state |
| acculynx_contact_id | TEXT | YES | - | AccuLynx contact UUID |
| acculynx_job_id | TEXT | YES | - | AccuLynx job UUID |
| sync_attempts | INTEGER | NO | 0 | Number of sync attempts |
| last_sync_error | TEXT | YES | - | Last sync error message |
| last_sync_at | TIMESTAMPTZ | YES | - | Last sync attempt timestamp |
| created_at | TIMESTAMPTZ | NO | NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NO | NOW() | Last update timestamp |
| completed_at | TIMESTAMPTZ | YES | - | Completion timestamp |

**Job Reference Format:**
```
SR-[5-digit number]
Starting at: SR-10001
Example: SR-10001, SR-10002, SR-10003...
```

**AccuLynx Sync Flow:**
1. Request created → `sync_status = 'pending_contact_creation'`
2. Contact created in AccuLynx → `acculynx_contact_id` set → `sync_status = 'pending_job_creation'`
3. Job created in AccuLynx → `acculynx_job_id` set → `sync_status = 'submitted'`
4. If sync fails → increment `sync_attempts`, set `last_sync_error`
5. After 3 failed attempts → `sync_status = 'requires_manual_review'`

---

### order_photos
Stores photo metadata for service requests. Actual files stored in Supabase Storage.

```sql
CREATE TABLE order_photos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Storage Info
  storage_path          TEXT NOT NULL,
  file_name             TEXT NOT NULL,
  file_size             INTEGER,
  mime_type             TEXT,
  
  -- User Data
  caption               TEXT,
  
  -- AccuLynx Sync
  uploaded_to_acculynx  BOOLEAN DEFAULT false,
  acculynx_file_id      TEXT,
  
  -- Metadata
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_photos_order_id ON order_photos(order_id);
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| order_id | UUID | NO | - | FK to orders.id |
| storage_path | TEXT | NO | - | Path in Supabase Storage bucket |
| file_name | TEXT | NO | - | Original file name |
| file_size | INTEGER | YES | - | File size in bytes |
| mime_type | TEXT | YES | - | MIME type (image/jpeg, image/png, etc.) |
| caption | TEXT | YES | - | User-provided caption |
| uploaded_to_acculynx | BOOLEAN | NO | false | Has photo been synced to AccuLynx |
| acculynx_file_id | TEXT | YES | - | AccuLynx file attachment ID |
| created_at | TIMESTAMPTZ | NO | NOW() | Upload timestamp |

**Storage Bucket Configuration:**
```
Bucket: service-request-photos
Path Format: {user_id}/{order_id}/{uuid}.{ext}
Max File Size: 10MB
Allowed Types: image/jpeg, image/png, image/heic
```

---

### user_devices
Stores device tokens for push notifications.

```sql
CREATE TABLE user_devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Device Info
  fcm_token       TEXT NOT NULL,
  platform        device_platform NOT NULL,
  device_name     TEXT,
  
  -- Status
  is_active       BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_fcm_token ON user_devices(fcm_token);
CREATE UNIQUE INDEX idx_user_devices_unique_token ON user_devices(fcm_token) WHERE is_active = true;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| user_id | UUID | NO | - | FK to profiles.id |
| fcm_token | TEXT | NO | - | Firebase Cloud Messaging token |
| platform | device_platform | NO | - | ios, android, or web |
| device_name | TEXT | YES | - | User-friendly device name |
| is_active | BOOLEAN | NO | true | Is token currently valid |
| created_at | TIMESTAMPTZ | NO | NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NO | NOW() | Last update timestamp |

**Business Rules:**
- Users can have multiple devices
- Inactive tokens should be cleaned up periodically
- FCM token must be unique among active devices

---

### notifications
Stores in-app notifications for users.

```sql
CREATE TABLE notifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Optional Link
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Content
  title                 TEXT NOT NULL,
  message               TEXT NOT NULL,
  type                  notification_type NOT NULL,
  
  -- Status
  read                  BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created_at ON notifications(user_id, created_at DESC);
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| user_id | UUID | NO | - | FK to profiles.id |
| order_id | UUID | YES | - | FK to orders.id (if order-related) |
| title | TEXT | NO | - | Notification title |
| message | TEXT | NO | - | Notification body text |
| type | notification_type | NO | - | 'order' or 'system' |
| read | BOOLEAN | NO | false | Has notification been read |
| created_at | TIMESTAMPTZ | NO | NOW() | Notification timestamp |

---

### webhook_logs
Stores incoming webhook payloads for debugging and audit trail.

```sql
CREATE TABLE webhook_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source Info
  source                TEXT NOT NULL,
  event_type            TEXT,
  
  -- Payload
  payload               JSONB NOT NULL,
  
  -- Optional Link
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Processing Status
  processed             BOOLEAN DEFAULT false,
  error_message         TEXT,
  
  -- Metadata
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhook_logs_source ON webhook_logs(source);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_processed ON webhook_logs(processed) WHERE processed = false;
```

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| source | TEXT | NO | - | Webhook source (e.g., "acculynx") |
| event_type | TEXT | YES | - | Event type (e.g., "job.updated") |
| payload | JSONB | NO | - | Raw webhook request body |
| order_id | UUID | YES | - | FK to orders.id (if matched) |
| processed | BOOLEAN | NO | false | Has webhook been processed |
| error_message | TEXT | YES | - | Processing error if any |
| created_at | TIMESTAMPTZ | NO | NOW() | Webhook received timestamp |

---

## 2.5 Relationships Summary

| Parent Table | Child Table | Relationship | On Delete |
|--------------|-------------|--------------|-----------|
| auth.users | profiles | 1:1 | CASCADE |
| profiles | addresses | 1:many | CASCADE |
| profiles | orders | 1:many | RESTRICT |
| profiles | user_devices | 1:many | CASCADE |
| profiles | notifications | 1:many | CASCADE |
| addresses | orders | 1:many | RESTRICT |
| orders | order_photos | 1:many | CASCADE |
| orders | notifications | 1:many | SET NULL |
| orders | webhook_logs | 1:many | SET NULL |

**Note on RESTRICT:**
- `orders` uses RESTRICT on user/address deletion to prevent orphaning historical records
- Users/addresses with associated service requests cannot be deleted (must be handled by business logic)

---

## 2.6 Row Level Security (RLS) Policies

All tables will have RLS enabled. Supabase Auth handles the `auth.uid()` function.

### profiles
```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### addresses
```sql
-- Users can CRUD their own addresses
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);
```

### orders
```sql
-- Users can read their own service requests
CREATE POLICY "Users can read own requests" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create service requests for themselves
CREATE POLICY "Users can create own requests" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update limited fields on their own requests
CREATE POLICY "Users can update own requests" ON orders
  FOR UPDATE USING (auth.uid() = user_id);
```

### order_photos
```sql
-- Users can manage photos for their own requests
CREATE POLICY "Users can manage own photos" ON order_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_photos.order_id
      AND orders.user_id = auth.uid()
    )
  );
```

### user_devices
```sql
-- Users can manage their own devices
CREATE POLICY "Users can manage own devices" ON user_devices
  FOR ALL USING (auth.uid() = user_id);
```

### notifications
```sql
-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## 2.7 Database Triggers

### Auto-update `updated_at` Timestamp
```sql
-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_devices_updated_at
  BEFORE UPDATE ON user_devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-create Profile on User Signup
```sql
-- Automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, email, phone, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'first_name', 'USER'), 4)) || 
    FLOOR(1000 + RANDOM() * 9000)::TEXT
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Ensure Single Default Address
```sql
-- When setting an address as default, unset others
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id
    AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_default
  BEFORE INSERT OR UPDATE ON addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_address();
```

---

## 2.8 Job Reference Sequence

```sql
-- Sequence for generating job reference numbers
CREATE SEQUENCE job_ref_seq START WITH 10001;

-- Function to generate job reference
CREATE OR REPLACE FUNCTION generate_job_ref()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SR-' || nextval('job_ref_seq')::TEXT;
END;
$$ language 'plpgsql';
```

**Usage in orders insert:**
```sql
INSERT INTO orders (job_ref, ...)
VALUES (generate_job_ref(), ...);
```

---

## 2.9 Storage Bucket Configuration

### service-request-photos Bucket

```sql
-- Create bucket (run via Supabase dashboard or management API)
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-request-photos', 'service-request-photos', false);

-- RLS policies for storage
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-request-photos' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY "Users can read own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'service-request-photos' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'service-request-photos' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
);
```

---

## 2.10 Migration Checklist

When implementing this schema in Supabase:

- [ ] Create all enum types
- [ ] Create `profiles` table with RLS
- [ ] Create auth trigger for auto-profile creation
- [ ] Create `addresses` table with RLS
- [ ] Create `orders` table with RLS
- [ ] Create `order_photos` table with RLS
- [ ] Create `user_devices` table with RLS
- [ ] Create `notifications` table with RLS
- [ ] Create `webhook_logs` table with RLS
- [ ] Create job reference sequence
- [ ] Create all indexes
- [ ] Create `updated_at` triggers
- [ ] Create single default address trigger
- [ ] Configure storage bucket
- [ ] Configure storage RLS policies
- [ ] Test all RLS policies

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2, 2025 | VRTS Labs | Initial schema design |

---

**Next Section:** [Section 3: App Backend API Specifications →]
