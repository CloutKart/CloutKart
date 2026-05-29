import { User } from '@supabase/supabase-js';

export function isAdminUser(user: User | null | undefined) {
  return user?.email?.toLowerCase().endsWith('@clout-kart.com') ?? false;
}
