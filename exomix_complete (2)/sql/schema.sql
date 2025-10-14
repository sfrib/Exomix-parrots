-- Minimal SQL for Supabase/Postgres (if not using Prisma migrations)
-- This mirrors the Prisma schema structures (simplified).

create table if not exists users (
  id text primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  role text not null default 'CHOVATEL',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists species (
  id text primary key default gen_random_uuid(),
  common text not null,
  latin text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists recipes (
  id text primary key default gen_random_uuid(),
  owner_id text references users(id) on delete cascade,
  species_id text references species(id) on delete set null,
  name text not null,
  version int not null default 1,
  diet_type text,
  medical boolean not null default false,
  status text not null default 'DRAFT',
  price_per_kg double precision,
  mix_items_json jsonb not null,
  nutrition_summary_json jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists vet_review_requests (
  id text primary key default gen_random_uuid(),
  recipe_id text references recipes(id) on delete cascade,
  sent_to_email text,
  vet_id text references users(id) on delete set null,
  channel text not null,
  created_at timestamp with time zone default now(),
  current_status text not null default 'PENDING'
);

create table if not exists vet_reviews (
  id text primary key default gen_random_uuid(),
  recipe_id text references recipes(id) on delete cascade,
  vet_id text references users(id) on delete set null,
  decision text not null,
  notes text,
  valid_until timestamp with time zone,
  signed_at timestamp with time zone default now(),
  signature_ref text
);

create table if not exists notifications (
  id text primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  type text not null,
  entity_type text not null,
  entity_id text not null,
  payload jsonb not null,
  status text not null default 'UNREAD',
  created_at timestamp with time zone default now(),
  read_at timestamp with time zone
);

create table if not exists email_queue (
  id text primary key default gen_random_uuid(),
  to_email text not null,
  subject text not null,
  html text,
  text text,
  status text not null default 'QUEUED',
  retries int not null default 0,
  error_msg text,
  created_at timestamp with time zone default now(),
  sent_at timestamp with time zone
);

create table if not exists user_notification_settings (
  id text primary key default gen_random_uuid(),
  user_id text unique references users(id) on delete cascade,
  email_enabled boolean not null default true,
  digest_daily boolean not null default false,
  push_enabled boolean not null default false,
  quiet_hours_json jsonb
);
