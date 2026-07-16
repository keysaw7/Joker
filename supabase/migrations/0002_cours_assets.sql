-- Bucket pour les assets de cours (images générées)

insert into storage.buckets (id, name, public)
values ('cours-assets', 'cours-assets', true)
on conflict (id) do nothing;

create policy "cours_assets_select_public"
  on storage.objects for select
  using (bucket_id = 'cours-assets');

create policy "cours_assets_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'cours-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "cours_assets_update_own"
  on storage.objects for update
  using (
    bucket_id = 'cours-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "cours_assets_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'cours-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
