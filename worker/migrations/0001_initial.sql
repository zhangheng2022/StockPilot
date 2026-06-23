create table if not exists decisions (
  id text primary key,
  user_id text not null,
  stock_code text not null,
  stock_name text not null,
  action text not null check (action in ('buy', 'add', 'reduce', 'hold', 'sell')),
  rationale text not null,
  evidence text not null,
  risk text not null,
  planned_position real not null,
  invalidation_condition text not null,
  exit_condition text not null,
  status text not null default 'draft' check (status in ('draft', 'pending_quality_check', 'pending_confirmation', 'card_created', 'abandoned')),
  quality_check text,
  created_at text not null,
  updated_at text not null
);

create index if not exists idx_decisions_user_created_at
  on decisions (user_id, created_at desc);

create table if not exists discipline_cards (
  id text primary key,
  decision_id text not null references decisions (id) on delete cascade,
  user_id text not null,
  core_thesis text not null,
  evidence_sources text,
  invalidation_condition text,
  monitoring_rules text,
  stop_loss_condition text,
  take_profit_condition text,
  status text not null default 'watching' check (status in ('watching', 'planned_holding', 'needs_review', 'risk_triggered', 'closed')),
  review_frequency text not null default 'daily',
  next_review_at text not null,
  history text,
  created_at text not null,
  updated_at text not null
);

create index if not exists idx_discipline_cards_due_review
  on discipline_cards (status, next_review_at);

create index if not exists idx_discipline_cards_user_status
  on discipline_cards (user_id, status);

create table if not exists trigger_events (
  id text primary key,
  discipline_card_id text not null references discipline_cards (id) on delete cascade,
  user_id text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'ignored', 'converted_to_review')),
  trigger_type text not null,
  triggered_condition text not null,
  evidence_source text,
  relation_to_plan text,
  suggested_actions text,
  created_at text not null,
  updated_at text not null
);

create index if not exists idx_trigger_events_card_status
  on trigger_events (discipline_card_id, status);

create index if not exists idx_trigger_events_user_created_at
  on trigger_events (user_id, created_at desc);

create table if not exists reviews (
  id text primary key,
  discipline_card_id text not null references discipline_cards (id) on delete cascade,
  user_id text not null,
  status text not null default 'pending' check (status in ('pending', 'attributed', 'confirmed')),
  execution_summary text,
  adherence_result text,
  attribution_tags text,
  notes text,
  created_at text not null,
  updated_at text not null
);

create index if not exists idx_reviews_card_created_at
  on reviews (discipline_card_id, created_at desc);

create index if not exists idx_reviews_user_created_at
  on reviews (user_id, created_at desc);

create table if not exists job_runs (
  id text primary key,
  job_name text not null,
  status text not null check (status in ('succeeded', 'failed')),
  scanned_count integer not null default 0,
  created_count integer not null default 0,
  error_message text,
  started_at text not null,
  finished_at text not null
);

create index if not exists idx_job_runs_job_started_at
  on job_runs (job_name, started_at desc);
