-- Schéma initial Joker — données scopées par utilisateur (RLS)

create table if not exists public.objectifs (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  domaine_id text not null,
  data jsonb not null,
  cree_le timestamptz not null default now()
);

create table if not exists public.profils (
  objectif_id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null
);

create table if not exists public.roadmaps (
  objectif_id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null
);

create table if not exists public.sessions (
  objectif_id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  domaine_id text not null,
  statut text not null,
  mise_a_jour timestamptz not null,
  data jsonb not null
);

create table if not exists public.profil_eleve (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  mise_a_jour timestamptz not null default now()
);

create index if not exists objectifs_user_domaine_idx on public.objectifs (user_id, domaine_id);
create index if not exists sessions_user_domaine_idx on public.sessions (user_id, domaine_id);
create index if not exists sessions_user_mise_a_jour_idx on public.sessions (user_id, mise_a_jour desc);

alter table public.objectifs enable row level security;
alter table public.profils enable row level security;
alter table public.roadmaps enable row level security;
alter table public.sessions enable row level security;
alter table public.profil_eleve enable row level security;

create policy "objectifs_select_own" on public.objectifs
  for select using (auth.uid() = user_id);
create policy "objectifs_insert_own" on public.objectifs
  for insert with check (auth.uid() = user_id);
create policy "objectifs_update_own" on public.objectifs
  for update using (auth.uid() = user_id);
create policy "objectifs_delete_own" on public.objectifs
  for delete using (auth.uid() = user_id);

create policy "profils_select_own" on public.profils
  for select using (auth.uid() = user_id);
create policy "profils_insert_own" on public.profils
  for insert with check (auth.uid() = user_id);
create policy "profils_update_own" on public.profils
  for update using (auth.uid() = user_id);
create policy "profils_delete_own" on public.profils
  for delete using (auth.uid() = user_id);

create policy "roadmaps_select_own" on public.roadmaps
  for select using (auth.uid() = user_id);
create policy "roadmaps_insert_own" on public.roadmaps
  for insert with check (auth.uid() = user_id);
create policy "roadmaps_update_own" on public.roadmaps
  for update using (auth.uid() = user_id);
create policy "roadmaps_delete_own" on public.roadmaps
  for delete using (auth.uid() = user_id);

create policy "sessions_select_own" on public.sessions
  for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on public.sessions
  for insert with check (auth.uid() = user_id);
create policy "sessions_update_own" on public.sessions
  for update using (auth.uid() = user_id);
create policy "sessions_delete_own" on public.sessions
  for delete using (auth.uid() = user_id);

create policy "profil_eleve_select_own" on public.profil_eleve
  for select using (auth.uid() = user_id);
create policy "profil_eleve_insert_own" on public.profil_eleve
  for insert with check (auth.uid() = user_id);
create policy "profil_eleve_update_own" on public.profil_eleve
  for update using (auth.uid() = user_id);
create policy "profil_eleve_delete_own" on public.profil_eleve
  for delete using (auth.uid() = user_id);
