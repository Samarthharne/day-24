import { format, getDay, parseISO, subWeeks } from 'date-fns';

import type { Activity, Category, Insight } from '@/types';
import { calculatePeriodCategoryTotals, calculateProductivityScore } from '@/utils/analytics';
import {
  formatDuration,
  getActivitiesForDay,
  getActivitiesInRange,
  getDateRange,
  getDaysInRange,
  getUniqueLoggedMinutes,
  getUnloggedMinutes,
} from '@/utils/time';

export function generateInsights(
  activities: Activity[],
  categories: Category[],
  referenceDate: Date = new Date(),
): Insight[] {
  const insights: Insight[] = [];
  const today = referenceDate;

  const todayLogged = getUniqueLoggedMinutes(activities, today);
  const todayUnlogged = getUnloggedMinutes(activities, today);

  if (todayUnlogged > 360) {
    insights.push({
      id: 'unlogged-today',
      icon: '⏰',
      title: 'Unlogged time today',
      description: `You have not logged activities for ${formatDuration(todayUnlogged)} today. Consider filling in your timeline.`,
      type: 'warning',
    });
  }

  const thisWeek = getDateRange('weekly', today);
  const lastWeekStart = subWeeks(thisWeek.start, 1);
  const lastWeekEnd = subWeeks(thisWeek.end, 1);

  const thisWeekActivities = getActivitiesInRange(activities, thisWeek.start, thisWeek.end);
  const lastWeekActivities = getActivitiesInRange(activities, lastWeekStart, lastWeekEnd);

  const workCategory = categories.find((c) => c.name === 'Work');
  if (workCategory) {
    const thisWeekWork = calculatePeriodCategoryTotals(thisWeekActivities, categories, thisWeek.start, thisWeek.end)
      .find((c) => c.categoryId === workCategory.id)?.minutes ?? 0;
    const lastWeekWork = calculatePeriodCategoryTotals(lastWeekActivities, categories, lastWeekStart, lastWeekEnd)
      .find((c) => c.categoryId === workCategory.id)?.minutes ?? 0;

    if (thisWeekWork > 0 && lastWeekWork > 0) {
      const diff = thisWeekWork - lastWeekWork;
      const hours = Math.abs(Math.round(diff / 60));
      if (Math.abs(diff) >= 60) {
        insights.push({
          id: 'work-comparison',
          icon: '💼',
          title: 'Work hours comparison',
          description: diff > 0
            ? `You spent ${hours} hours more on Work this week compared to last week.`
            : `You spent ${hours} hours less on Work this week compared to last week.`,
          type: diff > 0 ? 'neutral' : 'positive',
        });
      }
    }
  }

  const sleepCategory = categories.find((c) => c.name === 'Sleep');
  if (sleepCategory) {
    const weekDays = getDaysInRange(thisWeek.start, thisWeek.end);
    const sleepMinutes = weekDays.reduce((sum, day) => {
      const dayActivities = getActivitiesForDay(thisWeekActivities, day);
      const sleep = dayActivities
        .filter((a) => a.category_id === sleepCategory.id)
        .reduce((s, a) => s + a.duration_minutes, 0);
      return sum + sleep;
    }, 0);
    const avgSleep = weekDays.length > 0 ? sleepMinutes / weekDays.length : 0;
    if (avgSleep > 0) {
      insights.push({
        id: 'avg-sleep',
        icon: '😴',
        title: 'Average sleep',
        description: `Your average sleep is ${formatDuration(avgSleep)} per night this week.`,
        type: avgSleep >= 420 ? 'positive' : 'warning',
      });
    }
  }

  const productiveHours = new Map<number, number>();
  thisWeekActivities.forEach((activity) => {
    const category = categories.find((c) => c.id === activity.category_id);
    if (!category?.is_productive) return;
    const hour = parseISO(activity.start_time).getHours();
    productiveHours.set(hour, (productiveHours.get(hour) ?? 0) + activity.duration_minutes);
  });

  if (productiveHours.size > 0) {
    const sorted = Array.from(productiveHours.entries()).sort((a, b) => b[1] - a[1]);
    const topHour = sorted[0][0];
    const endHour = (topHour + 3) % 24;
    insights.push({
      id: 'peak-productivity',
      icon: '💡',
      title: 'Peak productivity window',
      description: `You are most productive between ${formatHour(topHour)} and ${formatHour(endHour)}. Consider scheduling important tasks during this time.`,
      type: 'positive',
    });
  }

  const dayProductivity = getDaysInRange(thisWeek.start, thisWeek.end).map((day) => ({
    day,
    score: calculateProductivityScore(thisWeekActivities, categories, day),
  }));

  if (dayProductivity.some((d) => d.score > 0)) {
    const best = dayProductivity.sort((a, b) => b.score - a.score)[0];
    insights.push({
      id: 'best-day',
      icon: '🏆',
      title: 'Most productive day',
      description: `${format(best.day, 'EEEE')} is your most productive day this week with a score of ${best.score}%.`,
      type: 'positive',
    });
  }

  const socialCategory = categories.find((c) => c.name === 'Social Media');
  if (socialCategory) {
    const thisSocial = calculatePeriodCategoryTotals(thisWeekActivities, categories, thisWeek.start, thisWeek.end)
      .find((c) => c.categoryId === socialCategory.id)?.minutes ?? 0;
    const lastSocial = calculatePeriodCategoryTotals(lastWeekActivities, categories, lastWeekStart, lastWeekEnd)
      .find((c) => c.categoryId === socialCategory.id)?.minutes ?? 0;

    if (lastSocial > 0 && thisSocial > lastSocial) {
      const increase = Math.round(((thisSocial - lastSocial) / lastSocial) * 100);
      if (increase >= 20) {
        insights.push({
          id: 'social-increase',
          icon: '📱',
          title: 'Social media usage',
          description: `Social media usage increased by ${increase}% compared to last week.`,
          type: 'warning',
        });
      }
    }
  }

  if (todayLogged > 0) {
    const score = calculateProductivityScore(activities, categories, today);
    if (score >= 80) {
      insights.push({
        id: 'great-day',
        icon: '⭐',
        title: 'Excellent day!',
        description: `Today's productivity score is ${score}%. Keep up the great work!`,
        type: 'positive',
      });
    }
  }

  return insights.slice(0, 6);
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h}:00 ${period}`;
}

export function calculateStreak(
  activities: Activity[],
  categoryId: string | null,
  days: number = 30,
): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayActivities = getActivitiesForDay(activities, date);
    const hasActivity = categoryId
      ? dayActivities.some((a) => a.category_id === categoryId)
      : dayActivities.length > 0;

    if (hasActivity) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

export function getMostProductiveDayOfWeek(
  activities: Activity[],
  categories: Category[],
): string {
  const dayScores = new Map<number, number[]>();

  activities.forEach((activity) => {
    const day = getDay(parseISO(activity.start_time));
    const category = categories.find((c) => c.id === activity.category_id);
    if (!category?.is_productive) return;
    const scores = dayScores.get(day) ?? [];
    scores.push(activity.productivity_rating ?? 3);
    dayScores.set(day, scores);
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestDay = 1;
  let bestAvg = 0;

  dayScores.forEach((scores, day) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDay = day;
    }
  });

  return dayNames[bestDay];
}
