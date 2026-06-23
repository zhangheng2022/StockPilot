pragma foreign_keys = off;

create table if not exists decisions_new (
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

insert or ignore into decisions_new (
  id,
  user_id,
  stock_code,
  stock_name,
  action,
  rationale,
  evidence,
  risk,
  planned_position,
  invalidation_condition,
  exit_condition,
  status,
  quality_check,
  created_at,
  updated_at
)
select
  id,
  user_id,
  stock_code,
  stock_name,
  case action
    when 'watch' then 'hold'
    else action
  end,
  rationale,
  evidence,
  risk,
  planned_position,
  invalidation_condition,
  exit_condition,
  case status
    when 'active' then 'pending_confirmation'
    when 'closed' then 'card_created'
    when 'archived' then 'abandoned'
    else status
  end,
  quality_check,
  created_at,
  updated_at
from decisions
where action in ('buy', 'add', 'reduce', 'hold', 'sell', 'watch')
  and status in ('draft', 'pending_quality_check', 'pending_confirmation', 'card_created', 'abandoned', 'active', 'closed', 'archived');

drop table decisions;
alter table decisions_new rename to decisions;

create index if not exists idx_decisions_user_created_at
  on decisions (user_id, created_at desc);

create table if not exists discipline_cards_new (
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

insert or ignore into discipline_cards_new
select
  id,
  decision_id,
  user_id,
  core_thesis,
  evidence_sources,
  invalidation_condition,
  monitoring_rules,
  stop_loss_condition,
  take_profit_condition,
  case status
    when 'archived' then 'closed'
    else status
  end,
  review_frequency,
  next_review_at,
  history,
  created_at,
  updated_at
from discipline_cards
where status in ('watching', 'planned_holding', 'needs_review', 'risk_triggered', 'closed', 'archived');

drop table discipline_cards;
alter table discipline_cards_new rename to discipline_cards;

create index if not exists idx_discipline_cards_due_review
  on discipline_cards (status, next_review_at);

create index if not exists idx_discipline_cards_user_status
  on discipline_cards (user_id, status);

create table if not exists trigger_events_new (
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

insert or ignore into trigger_events_new
select
  id,
  discipline_card_id,
  user_id,
  case status
    when 'open' then 'pending'
    when 'acknowledged' then 'confirmed'
    when 'dismissed' then 'ignored'
    when 'resolved' then 'converted_to_review'
    else status
  end,
  trigger_type,
  triggered_condition,
  evidence_source,
  relation_to_plan,
  suggested_actions,
  created_at,
  updated_at
from trigger_events
where status in ('pending', 'confirmed', 'ignored', 'converted_to_review', 'open', 'acknowledged', 'dismissed', 'resolved');

drop table trigger_events;
alter table trigger_events_new rename to trigger_events;

create index if not exists idx_trigger_events_card_status
  on trigger_events (discipline_card_id, status);

create index if not exists idx_trigger_events_user_created_at
  on trigger_events (user_id, created_at desc);

create table if not exists reviews_new (
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

insert or ignore into reviews_new
select
  id,
  discipline_card_id,
  user_id,
  case status
    when 'draft' then 'pending'
    when 'submitted' then 'confirmed'
    when 'archived' then 'confirmed'
    else status
  end,
  execution_summary,
  adherence_result,
  attribution_tags,
  notes,
  created_at,
  updated_at
from reviews
where status in ('pending', 'attributed', 'confirmed', 'draft', 'submitted', 'archived');

drop table reviews;
alter table reviews_new rename to reviews;

create index if not exists idx_reviews_card_created_at
  on reviews (discipline_card_id, created_at desc);

create index if not exists idx_reviews_user_created_at
  on reviews (user_id, created_at desc);

pragma foreign_keys = on;

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
