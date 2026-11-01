import { parseISO } from 'date-fns';

import type { Activity, Category, CategoryBreakdown, DailyStats } from '@/types';
import {
  getActivitiesForDay,
  getActivityInterval,
  getMinutesBetween,
  getUniqueLoggedMinutes,
  getUnloggedMinutes,
  MINUTES_IN_DAY,
} from '@/utils/time';

export function calculateCategoryBreakdown(
  activities: Activity[],
  categories: Category[],
  day: Date,
): CategoryBreakdown[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const breakdown = new Map<string, number>();

  getActivitiesForDay(activities, day).forEach((activity) => {
    const interval = getActivityInterval(activity, day);
    if (!interval || !activity.category_id) return;
    const minutes = getMinutesBetween(interval.start, interval.end);
    breakdown.set(activity.category_id, (breakdown.get(activity.category_id) ?? 0) + minutes);
  });

  const total = Array.from(breakdown.values()).reduce((sum, m) => sum + m, 0) || 1;

  return Array.from(breakdown.entries())
    .map(([categoryId, minutes]) => {
      const category = categoryMap.get(categoryId);
      return {
        categoryId,
        categoryName: category?.name ?? 'Unknown',
        icon: category?.icon ?? '📌',
        color: category?.color ?? '#6B7280',
        minutes,
        percentage: Math.round((minutes / total) * 100),
      };
    })
    .sort((a, b) => b.minutes - a.minutes);
}

export function calculateProductivityScore(
  activities: Activity[],
  categories: Category[],
  day: Date,
): number {
  const productiveCategoryIds = new Set(
    categories.filter((c) => c.is_productive).map((c) => c.id),
  );

  const dayActivities = getActivitiesForDay(activities, day);
  let totalWeight = 0;
  let weightedSum = 0;

  dayActivities.forEach((activity) => {
    const interval = getActivityInterval(activity, day);
    if (!interval || !activity.category_id) return;

    const minutes = getMinutesBetween(interval.start, interval.end);
    if (!productiveCategoryIds.has(activity.category_id)) return;

    const rating = activity.productivity_rating ?? 3;
    totalWeight += minutes;
    weightedSum += minutes * (rating / 5);
  });

  if (totalWeight === 0) {
    const logged = getUniqueLoggedMinutes(activities, day);
    if (logged === 0) return 0;
    return Math.round((logged / MINUTES_IN_DAY) * 50);
  }

  return Math.round((weightedSum / totalWeight) * 100);
}

export function calculateDailyStats(
  activities: Activity[],
  categories: Category[],
  day: Date,
): DailyStats {
  const uniqueLoggedMinutes = getUniqueLoggedMinutes(activities, day);
  const categoryBreakdown = calculateCategoryBreakdown(activities, categories, day);

  return {
    totalLoggedMinutes: categoryBreakdown.reduce((sum, c) => sum + c.minutes, 0),
    uniqueLoggedMinutes,
    unloggedMinutes: getUnloggedMinutes(activities, day),
    categoryBreakdown,
    productivityScore: calculateProductivityScore(activities, categories, day),
    mostUsedCategory: categoryBreakdown[0] ?? null,
  };
}

export function calculatePeriodCategoryTotals(
  activities: Activity[],
  categories: Category[],
  start: Date,
  end: Date,
): CategoryBreakdown[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const breakdown = new Map<string, number>();

  activities.forEach((activity) => {
    const activityStart = parseISO(activity.start_time);
    const activityEnd = parseISO(activity.end_time);
    if (activityEnd <= start || activityStart >= end || !activity.category_id) return;

    const effectiveStart = activityStart < start ? start : activityStart;
    const effectiveEnd = activityEnd > end ? end : activityEnd;
    const minutes = getMinutesBetween(effectiveStart, effectiveEnd);
    breakdown.set(activity.category_id, (breakdown.get(activity.category_id) ?? 0) + minutes);
  });

  const total = Array.from(breakdown.values()).reduce((sum, m) => sum + m, 0) || 1;

  return Array.from(breakdown.entries())
    .map(([categoryId, minutes]) => {
      const category = categoryMap.get(categoryId);
      return {
        categoryId,
        categoryName: category?.name ?? 'Unknown',
        icon: category?.icon ?? '📌',
        color: category?.color ?? '#6B7280',
        minutes,
        percentage: Math.round((minutes / total) * 100),
      };
    })
    .sort((a, b) => b.minutes - a.minutes);
}

export function calculateGoalProgress(
  goalMinutes: number,
  activities: Activity[],
  categoryId: string | null,
  start: Date,
  end: Date,
): { currentMinutes: number; percentage: number } {
  let currentMinutes = 0;

  activities.forEach((activity) => {
    if (categoryId && activity.category_id !== categoryId) return;
    const activityStart = parseISO(activity.start_time);
    const activityEnd = parseISO(activity.end_time);
    if (activityEnd <= start || activityStart >= end) return;

    const effectiveStart = activityStart < start ? start : activityStart;
    const effectiveEnd = activityEnd > end ? end : activityEnd;
    currentMinutes += getMinutesBetween(effectiveStart, effectiveEnd);
  });

  return {
    currentMinutes,
    percentage: Math.min(100, Math.round((currentMinutes / goalMinutes) * 100)),
  };
}

export function getWeeklyComparison(
  thisWeekMinutes: number,
  lastWeekMinutes: number,
): { diff: number; percentage: number; direction: 'up' | 'down' | 'same' } {
  const diff = thisWeekMinutes - lastWeekMinutes;
  const percentage = lastWeekMinutes > 0
    ? Math.round((diff / lastWeekMinutes) * 100)
    : thisWeekMinutes > 0 ? 100 : 0;

  return {
    diff,
    percentage: Math.abs(percentage),
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
  };
}

export function calculatePlanningScore(
  plannedMinutes: number,
  actualMinutes: number,
): number {
  if (plannedMinutes === 0) return actualMinutes > 0 ? 50 : 0;
  const ratio = actualMinutes / plannedMinutes;
  if (ratio >= 0.9 && ratio <= 1.1) return 100;
  if (ratio >= 0.7 && ratio <= 1.3) return 75;
  if (ratio >= 0.5) return 50;
  return 25;
}
