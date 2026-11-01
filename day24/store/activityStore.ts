import { format } from 'date-fns';
import { create } from 'zustand';

import * as activityService from '@/services/activities';
import type { Activity, ActivityFormData } from '@/types';

interface ActivityState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  selectedDate: Date;
  fetchForDay: (date: Date) => Promise<void>;
  fetchRange: (start: Date, end: Date) => Promise<void>;
  create: (userId: string, data: ActivityFormData) => Promise<Activity>;
  update: (id: string, data: Partial<ActivityFormData>) => Promise<Activity>;
  remove: (id: string) => Promise<void>;
  duplicate: (activity: Activity, userId: string) => Promise<Activity>;
  setSelectedDate: (date: Date) => void;
  search: (query: string) => Promise<Activity[]>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  loading: false,
  error: null,
  selectedDate: new Date(),

  fetchForDay: async (date) => {
    set({ loading: true, error: null });
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const activities = await activityService.fetchActivitiesForDay(dateStr);
      set({ activities, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchRange: async (start, end) => {
    set({ loading: true, error: null });
    try {
      const activities = await activityService.fetchActivities(
        start.toISOString(),
        end.toISOString(),
      );
      set({ activities, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  create: async (userId, data) => {
    const activity = await activityService.createActivity(userId, data);
    set((state) => ({ activities: [...state.activities, activity] }));
    return activity;
  },

  update: async (id, data) => {
    const activity = await activityService.updateActivity(id, data);
    set((state) => ({
      activities: state.activities.map((a) => (a.id === id ? activity : a)),
    }));
    return activity;
  },

  remove: async (id) => {
    await activityService.deleteActivity(id);
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    }));
  },

  duplicate: async (activity, userId) => {
    const newActivity = await activityService.duplicateActivity(activity, userId);
    set((state) => ({ activities: [...state.activities, newActivity] }));
    return newActivity;
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  search: async (query) => {
    return activityService.searchActivities(query);
  },
}));
