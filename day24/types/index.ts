export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed' | 'cancelled';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly';
export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  onboarding_goals: string[];
  theme_preference: 'light' | 'dark' | 'system';
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_productive: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  category_id: string | null;
  task_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  productivity_rating: number | null;
  is_planned: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Task {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null;
  estimated_duration_minutes: number | null;
  actual_duration_minutes: number;
  status: TaskStatus;
  is_recurring: boolean;
  recurrence_rule: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Goal {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  target_minutes: number;
  period_type: GoalPeriod;
  start_date: string;
  end_date: string | null;
  created_at: string;
  category?: Category;
}

export interface PlannedBlock {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  planned_date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  category?: Category;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  morning_reminder: boolean;
  morning_time: string;
  afternoon_reminder: boolean;
  afternoon_time: string;
  evening_reminder: boolean;
  evening_time: string;
  task_reminders: boolean;
  created_at: string;
}

export interface ActivitySuggestion {
  id: string;
  user_id: string;
  title: string;
  category_id: string | null;
  use_count: number;
  last_used_at: string;
}

export interface TimeInterval {
  start: Date;
  end: Date;
  activityId?: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  minutes: number;
  percentage: number;
}

export interface DailyStats {
  totalLoggedMinutes: number;
  uniqueLoggedMinutes: number;
  unloggedMinutes: number;
  categoryBreakdown: CategoryBreakdown[];
  productivityScore: number;
  mostUsedCategory: CategoryBreakdown | null;
}

export interface Insight {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: 'positive' | 'neutral' | 'warning';
}

export interface OverlapConflict {
  activity: Activity;
  overlapMinutes: number;
}

export interface ActivityFormData {
  title: string;
  description?: string;
  category_id: string;
  start_time: Date;
  end_time: Date;
  productivity_rating?: number;
  is_planned?: boolean;
  tags?: string[];
  task_id?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  category_id?: string;
  priority: Priority;
  due_date?: string;
  estimated_duration_minutes?: number;
  is_recurring?: boolean;
  scheduled_start?: Date;
  scheduled_end?: Date;
}

export interface GoalFormData {
  title: string;
  category_id?: string;
  target_minutes: number;
  period_type: GoalPeriod;
  start_date: string;
}
