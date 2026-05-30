-- ─── Notifications table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  is_admin_notification boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_admin ON notifications(created_at DESC) WHERE is_admin_notification = true;

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Clients read their own notifications
CREATE POLICY "clients_read_own_notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND is_admin_notification = false);

-- Admins read all admin notifications
CREATE POLICY "admins_read_notifications" ON notifications
  FOR SELECT TO authenticated
  USING (is_admin_notification = true AND auth.email() LIKE '%@clout-kart.com');

-- Clients mark their own notifications as read
CREATE POLICY "clients_update_own_notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND is_admin_notification = false)
  WITH CHECK (user_id = auth.uid() AND is_admin_notification = false);

-- Admins mark admin notifications as read
CREATE POLICY "admins_update_notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (is_admin_notification = true AND auth.email() LIKE '%@clout-kart.com')
  WITH CHECK (is_admin_notification = true);

-- Clients can insert their own subscription expiry notifications
CREATE POLICY "clients_insert_expiry_notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND is_admin_notification = false
    AND type IN ('subscription_expiring', 'subscription_expired')
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ─── Trigger: new user signup → admin notification ───────────────────────────
CREATE OR REPLACE FUNCTION notify_admin_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO notifications (type, title, body, data, is_admin_notification)
  VALUES (
    'new_user',
    'New user signed up',
    COALESCE(NEW.full_name, 'Someone') || ' just created an account',
    jsonb_build_object('user_id', NEW.id, 'full_name', NEW.full_name, 'plan', NEW.plan),
    true
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_user_notify_admin
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION notify_admin_new_user();

-- ─── Trigger: new creative request → admin notification ──────────────────────
CREATE OR REPLACE FUNCTION notify_admin_new_creative()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_client_name text;
BEGIN
  SELECT full_name INTO v_client_name FROM profiles WHERE id = NEW.user_id;
  INSERT INTO notifications (type, title, body, data, is_admin_notification)
  VALUES (
    'new_creative_request',
    'New creative request',
    COALESCE(v_client_name, 'A client') || ' submitted a brief for ' || NEW.brand_name,
    jsonb_build_object('request_id', NEW.id, 'user_id', NEW.user_id, 'brand_name', NEW.brand_name, 'ad_format', NEW.ad_format),
    true
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_creative_notify_admin
  AFTER INSERT ON free_creative_requests
  FOR EACH ROW EXECUTE FUNCTION notify_admin_new_creative();

-- ─── Trigger: creative status change → client notification ───────────────────
CREATE OR REPLACE FUNCTION notify_client_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_label text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_label := CASE NEW.status
      WHEN 'in_progress' THEN 'in production'
      WHEN 'completed'   THEN 'ready to download'
      ELSE REPLACE(NEW.status, '_', ' ')
    END;
    INSERT INTO notifications (user_id, type, title, body, data, is_admin_notification)
    VALUES (
      NEW.user_id,
      'creative_status',
      CASE NEW.status WHEN 'completed' THEN 'Creative ready: ' || NEW.brand_name ELSE 'Creative update: ' || NEW.brand_name END,
      'Your creative for ' || NEW.brand_name || ' is now ' || v_label,
      jsonb_build_object('request_id', NEW.id, 'brand_name', NEW.brand_name, 'status', NEW.status),
      false
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_creative_status_notify_client
  AFTER UPDATE OF status ON free_creative_requests
  FOR EACH ROW EXECUTE FUNCTION notify_client_status_change();

-- ─── Trigger: message sent → notify the other party ─────────────────────────
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_client_name text;
  v_brand_name text;
BEGIN
  IF NOT NEW.is_from_admin THEN
    SELECT full_name INTO v_client_name FROM profiles WHERE id = NEW.user_id;
    IF NEW.type = 'feedback' THEN
      SELECT brand_name INTO v_brand_name FROM free_creative_requests WHERE id = NEW.creative_request_id;
      INSERT INTO notifications (type, title, body, data, is_admin_notification)
      VALUES (
        'new_feedback',
        'New feedback',
        COALESCE(v_client_name, 'A client') || ' left feedback on ' || COALESCE(v_brand_name, 'a creative'),
        jsonb_build_object('user_id', NEW.user_id, 'message_id', NEW.id, 'creative_request_id', NEW.creative_request_id),
        true
      );
    ELSE
      INSERT INTO notifications (type, title, body, data, is_admin_notification)
      VALUES (
        'new_message',
        'New message',
        COALESCE(v_client_name, 'A client') || ' sent a message',
        jsonb_build_object('user_id', NEW.user_id, 'message_id', NEW.id),
        true
      );
    END IF;
  ELSE
    INSERT INTO notifications (user_id, type, title, body, data, is_admin_notification)
    VALUES (
      NEW.user_id,
      'new_message',
      'New message from CloutKart',
      'Your CloutKart team sent you a message',
      jsonb_build_object('message_id', NEW.id),
      false
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_notify
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_on_message();

-- ─── Trigger: payment received → admin notification ──────────────────────────
CREATE OR REPLACE FUNCTION notify_admin_new_payment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_client_name text;
BEGIN
  SELECT full_name INTO v_client_name FROM profiles WHERE id = NEW.user_id;
  INSERT INTO notifications (type, title, body, data, is_admin_notification)
  VALUES (
    'new_payment',
    'Payment received',
    COALESCE(v_client_name, 'A client') || ' paid ' || chr(8377) || (NEW.amount / 100)::text,
    jsonb_build_object('user_id', NEW.user_id, 'payment_id', NEW.payment_id, 'amount', NEW.amount),
    true
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_payment_notify_admin
  AFTER INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION notify_admin_new_payment();
