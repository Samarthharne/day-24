import { create } from 'zustand';

import * as goalService from '@/services/goals';
import type { Goal, GoalFormData } from '@/types';

interface GoalState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (userId: string, data: GoalFormData) => Promise<Goal>;
  update: (id: string, data: Partial<GoalFormData>) => Promise<Goal>;
  remove: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const goals = await goalService.fetchGoals();
      set({ goals, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  create: async (userId, data) => {
    const goal = await goalService.createGoal(userId, data);
    set((state) => ({ goals: [goal, ...state.goals] }));
    return goal;
  },

  update: async (id, data) => {
    const goal = await goalService.updateGoal(id, data);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? goal : g)),
    }));
    return goal;
  },

  remove: async (id) => {
    await goalService.deleteGoal(id);
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    }));
  },
}));
