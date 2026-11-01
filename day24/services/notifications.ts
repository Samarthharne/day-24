import { supabase } from '@/lib/supabase';
import type { NotificationSettings } from '@/types';

export async function fetchNotificationSettings(userId: string): Promise<NotificationSettings | null> {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateNotificationSettings(
  userId: string,
  updates: Partial<NotificationSettings>,
): Promise<NotificationSettings> {
  const { data, error } = await supabase
    .from('notification_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
