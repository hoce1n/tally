create table if not exists rooms (
  id text primary key,
  host_secret_hash text not null,
  question text not null,
  status text not null default 'gathering'
    check (status in ('gathering', 'voting', 'revealed', 'resolved', 'ended')),
  selected_option_id text null,
  resolution_note text null,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  voting_started_at timestamptz null,
  revealed_at timestamptz null,
  resolved_at timestamptz null,
  ended_at timestamptz null,
  expires_at timestamptz not null
);

create table if not exists room_options (
  id text primary key,
  room_id text not null references rooms(id) on delete cascade,
  ordinal smallint not null check (ordinal between 0 and 4),
  label text not null,
  unique (room_id, ordinal)
);

create table if not exists room_participant_sessions (
  id text primary key,
  room_id text not null references rooms(id) on delete cascade,
  secret_hash text not null,
  vote_option_id text null,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  voted_at timestamptz null,
  unique (room_id, secret_hash)
);

create index if not exists rooms_live_by_expiry
  on rooms (expires_at)
  where status <> 'ended';

create index if not exists room_participant_sessions_by_room
  on room_participant_sessions (room_id);
