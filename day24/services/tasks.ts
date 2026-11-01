import { supabase } from '@/lib/supabase';
import type { Task, TaskFormData } from '@/types';

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchTask(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createTask(userId: string, form: TaskFormData): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: form.title.trim(),
      description: form.description?.trim() || null,
      category_id: form.category_id || null,
      priority: form.priority,
      due_date: form.due_date || null,
      estimated_duration_minutes: form.estimated_duration_minutes || null,
      is_recurring: form.is_recurring ?? false,
      scheduled_start: form.scheduled_start?.toISOString() || null,
      scheduled_end: form.scheduled_end?.toISOString() || null,
    })
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<TaskFormData & { status: string; actual_duration_minutes: number }>): Promise<Task> {
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title.trim();
  if (updates.description !== undefined) payload.description = updates.description?.trim() || null;
  if (updates.category_id !== undefined) payload.category_id = updates.category_id || null;
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.due_date !== undefined) payload.due_date = updates.due_date || null;
  if (updates.estimated_duration_minutes !== undefined) payload.estimated_duration_minutes = updates.estimated_duration_minutes;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.actual_duration_minutes !== undefined) payload.actual_duration_minutes = updates.actual_duration_minutes;
  if (updates.scheduled_start !== undefined) payload.scheduled_start = updates.scheduled_start?.toISOString() || null;
  if (updates.scheduled_end !== undefined) payload.scheduled_end = updates.scheduled_end?.toISOString() || null;

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function completeTask(id: string): Promise<Task> {
  return updateTask(id, { status: 'completed' });
}
