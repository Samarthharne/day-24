import {
  addDays,
  differenceInMinutes,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

import type { Activity, TimeInterval } from '@/types';

export const MINUTES_IN_DAY = 24 * 60;
export const HOUR_HEIGHT = 64;

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE, MMMM d');
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
}

export function getMinutesBetween(start: Date, end: Date): number {
  return Math.max(0, differenceInMinutes(end, start));
}

export function clampToDay(date: Date, day: Date): Date {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  if (date < dayStart) return dayStart;
  if (date > dayEnd) return dayEnd;
  return date;
}

export function getActivityInterval(activity: Activity, day: Date): TimeInterval | null {
  const start = parseISO(activity.start_time);
  const end = parseISO(activity.end_time);
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  if (end <= dayStart || start >= dayEnd) return null;

  return {
    start: start < dayStart ? dayStart : start,
    end: end > dayEnd ? dayEnd : end,
    activityId: activity.id,
  };
}

export function getActivitiesForDay(activities: Activity[], day: Date): Activity[] {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  return activities.filter((activity) => {
    const start = parseISO(activity.start_time);
    const end = parseISO(activity.end_time);
    return start < dayEnd && end > dayStart;
  });
}

export function mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
  if (intervals.length === 0) return [];

  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: TimeInterval[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      if (current.end > last.end) last.end = current.end;
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

export function getUniqueLoggedMinutes(activities: Activity[], day: Date): number {
  const intervals = getActivitiesForDay(activities, day)
    .map((a) => getActivityInterval(a, day))
    .filter((i): i is TimeInterval => i !== null);

  return mergeIntervals(intervals).reduce(
    (sum, interval) => sum + getMinutesBetween(interval.start, interval.end),
    0,
  );
}

export function getTotalLoggedMinutes(activities: Activity[], day: Date): number {
  return getActivitiesForDay(activities, day).reduce((sum, activity) => {
    const interval = getActivityInterval(activity, day);
    if (!interval) return sum;
    return sum + getMinutesBetween(interval.start, interval.end);
  }, 0);
}

export function getUnloggedMinutes(activities: Activity[], day: Date): number {
  return Math.max(0, MINUTES_IN_DAY - getUniqueLoggedMinutes(activities, day));
}

export function getMinutesFromDayStart(date: Date, day: Date): number {
  const dayStart = startOfDay(day);
  return Math.max(0, differenceInMinutes(date, dayStart));
}

export function getTimelinePosition(start: Date, end: Date, day: Date): { top: number; height: number } {
  const dayStart = startOfDay(day);
  const clampedStart = start < dayStart ? dayStart : start;
  const clampedEnd = end > endOfDay(day) ? endOfDay(day) : end;
  const startMinutes = getMinutesFromDayStart(clampedStart, day);
  const durationMinutes = getMinutesBetween(clampedStart, clampedEnd);

  return {
    top: (startMinutes / MINUTES_IN_DAY) * HOUR_HEIGHT * 24,
    height: Math.max((durationMinutes / MINUTES_IN_DAY) * HOUR_HEIGHT * 24, 28),
  };
}

export function intervalsOverlap(a: TimeInterval, b: TimeInterval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function findOverlaps(
  newStart: Date,
  newEnd: Date,
  activities: Activity[],
  excludeId?: string,
): Activity[] {
  const newInterval: TimeInterval = { start: newStart, end: newEnd };

  return activities.filter((activity) => {
    if (excludeId && activity.id === excludeId) return false;
    const interval: TimeInterval = {
      start: parseISO(activity.start_time),
      end: parseISO(activity.end_time),
    };
    return intervalsOverlap(newInterval, interval);
  });
}

export function combineDateAndTime(date: Date, time: Date): Date {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
}

export function roundToNearestMinutes(date: Date, minutes: number): Date {
  const ms = 1000 * 60 * minutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

export function getDateRange(period: 'daily' | 'weekly' | 'monthly', referenceDate: Date) {
  switch (period) {
    case 'daily':
      return { start: startOfDay(referenceDate), end: endOfDay(referenceDate) };
    case 'weekly':
      return {
        start: startOfWeek(referenceDate, { weekStartsOn: 1 }),
        end: endOfWeek(referenceDate, { weekStartsOn: 1 }),
      };
    case 'monthly':
      return { start: startOfMonth(referenceDate), end: endOfMonth(referenceDate) };
  }
}

export function getActivitiesInRange(activities: Activity[], start: Date, end: Date): Activity[] {
  return activities.filter((activity) => {
    const activityStart = parseISO(activity.start_time);
    const activityEnd = parseISO(activity.end_time);
    return activityStart < end && activityEnd > start;
  });
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isCurrentHour(hour: number): boolean {
  return new Date().getHours() === hour;
}

export function getHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

export function activityOverlapsDay(activity: Activity, day: Date): boolean {
  const start = parseISO(activity.start_time);
  const end = parseISO(activity.end_time);
  return isWithinInterval(startOfDay(day), { start, end }) ||
    isWithinInterval(endOfDay(day), { start, end }) ||
    (start <= startOfDay(day) && end >= endOfDay(day)) ||
    isSameDay(start, day) ||
    isSameDay(end, day) ||
    (start < endOfDay(day) && end > startOfDay(day));
}

export function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let current = startOfDay(start);
  const last = startOfDay(end);
  while (current <= last) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
}
