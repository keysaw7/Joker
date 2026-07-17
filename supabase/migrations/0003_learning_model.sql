-- Learning Model : snapshots ModeleApprenant + log append-only d'observations

create table if not exists public.modeles_apprenant (
  eleve_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null,
  mise_a_jour timestamptz not null default now(),
  primary key (user_id, eleve_id)
);

create table if not exists public.observations_apprentissage (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  eleve_id text not null,
  type text not null,
  horodatage timestamptz not null,
  data jsonb not null
);

create index if not exists observations_user_eleve_horodatage_idx
  on public.observations_apprentissage (user_id, eleve_id, horodatage);

alter table public.modeles_apprenant enable row level security;
alter table public.observations_apprentissage enable row level security;

create policy "modeles_apprenant_select_own" on public.modeles_apprenant
  for select using (auth.uid() = user_id);
create policy "modeles_apprenant_insert_own" on public.modeles_apprenant
  for insert with check (auth.uid() = user_id);
create policy "modeles_apprenant_update_own" on public.modeles_apprenant
  for update using (auth.uid() = user_id);
create policy "modeles_apprenant_delete_own" on public.modeles_apprenant
  for delete using (auth.uid() = user_id);

create policy "observations_select_own" on public.observations_apprentissage
  for select using (auth.uid() = user_id);
create policy "observations_insert_own" on public.observations_apprentissage
  for insert with check (auth.uid() = user_id);
create policy "observations_delete_own" on public.observations_apprentissage
  for delete using (auth.uid() = user_id);
