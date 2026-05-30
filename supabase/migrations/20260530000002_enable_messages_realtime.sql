-- Enable real-time replication for the messages table.
-- Without this, Supabase Realtime won't broadcast INSERT/UPDATE events
-- even if the subscription is set up correctly on the client.
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
