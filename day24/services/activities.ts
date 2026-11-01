import { supabase } from '@/lib/supabase';
import type { Activity, ActivityFormData } from '@/types';

export async function fetchActivities(startDate: string, endDate: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*, category:categories(*)')
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchActivitiesForDay(date: string): Promise<Activity[]> {
  const dayStart = `${date}T00:00:00`;
  const dayEnd = `${date}T23:59:59`;

  const { data, error } = await supabase
    .from('activities')
    .select('*, category:categories(*)')
    .or(`and(start_time.lte.${dayEnd},end_time.gte.${dayStart})`)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createActivity(userId: string, form: ActivityFormData): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .insert({
      user_id: userId,
      title: form.title.trim(),
      description: form.description?.trim() || null,
      category_id: form.category_id,
      start_time: form.start_time.toISOString(),
      end_time: form.end_time.toISOString(),
      productivity_rating: form.productivity_rating ?? null,
      is_planned: form.is_planned ?? false,
      tags: form.tags ?? [],
      task_id: form.task_id ?? null,
    })
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;

  await upsertSuggestion(userId, form.title, form.category_id);
  return data;
}

export async function updateActivity(id: string, form: Partial<ActivityFormData>): Promise<Activity> {
  const updates: Record<string, unknown> = {};
  if (form.title !== undefined) updates.title = form.title.trim();
  if (form.description !== undefined) updates.description = form.description?.trim() || null;
  if (form.category_id !== undefined) updates.category_id = form.category_id;
  if (form.start_time !== undefined) updates.start_time = form.start_time.toISOString();
  if (form.end_time !== undefined) updates.end_time = form.end_time.toISOString();
  if (form.productivity_rating !== undefined) updates.productivity_rating = form.productivity_rating;
  if (form.is_planned !== undefined) updates.is_planned = form.is_planned;
  if (form.tags !== undefined) updates.tags = form.tags;

  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteActivity(id: string) {
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateActivity(activity: Activity, userId: string): Promise<Activity> {
  const start = new Date(activity.start_time);
  const end = new Date(activity.end_time);
  const duration = end.getTime() - start.getTime();
  const now = new Date();
  const newEnd = new Date(now.getTime() + duration);

  return createActivity(userId, {
    title: activity.title,
    description: activity.description ?? undefined,
    category_id: activity.category_id!,
    start_time: now,
    end_time: newEnd,
    productivity_rating: activity.productivity_rating ?? undefined,
    is_planned: activity.is_planned,
    tags: activity.tags,
  });
}

export async function searchActivities(query: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*, category:categories(*)')
    .ilike('title', `%${query}%`)
    .order('start_time', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

async function upsertSuggestion(userId: string, title: string, categoryId: string) {
  const { data: existing } = await supabase
    .from('activity_suggestions')
    .select('id, use_count')
    .eq('user_id', userId)
    .eq('title', title.trim())
    .maybeSingle();

  if (existing) {
    await supabase
      .from('activity_suggestions')
      .update({ use_count: existing.use_count + 1, last_used_at: new Date().toISOString(), category_id: categoryId })
      .eq('id', existing.id);
  } else {
    await supabase.from('activity_suggestions').insert({
      user_id: userId,
      title: title.trim(),
      category_id: categoryId,
    });
  }
}

export async function fetchSuggestions(userId: string) {
  const { data, error } = await supabase
    .from('activity_suggestions')
    .select('*')
    .eq('user_id', userId)
    .order('use_count', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}
