import { supabase } from '@/lib/supabase';
import type { Goal, GoalFormData } from '@/types';

export async function fetchGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createGoal(userId: string, form: GoalFormData): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      title: form.title.trim(),
      category_id: form.category_id || null,
      target_minutes: form.target_minutes,
      period_type: form.period_type,
      start_date: form.start_date,
    })
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateGoal(id: string, updates: Partial<GoalFormData>): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}
