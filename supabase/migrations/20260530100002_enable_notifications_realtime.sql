-- Required for realtime filtered subscriptions to work correctly.
-- Without REPLICA IDENTITY FULL, Supabase Realtime may not broadcast the full
-- row payload when filtering on non-primary-key columns (e.g. user_id, is_admin_notification).
ALTER TABLE notifications REPLICA IDENTITY FULL;
