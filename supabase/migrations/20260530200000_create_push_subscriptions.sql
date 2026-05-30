-- Push subscriptions for Web Push API
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    text        NOT NULL,
  p256dh      text        NOT NULL,
  auth        text        NOT NULL,
  is_admin    boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own subscriptions
CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions FOR ALL
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can read all subscriptions (needed by edge function via service role, not this policy)
-- The edge function uses the service role key and bypasses RLS.
