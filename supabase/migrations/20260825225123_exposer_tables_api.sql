-- La stack locale n'auto-expose plus les tables public aux rôles Data API.
-- Sans ces GRANT, PostgREST renvoie "permission denied" malgré le RLS.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to anon, authenticated;

grant all on all tables in schema public to service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

alter default privileges in schema public
  grant all on tables to service_role;
