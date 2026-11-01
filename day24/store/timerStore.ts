import { create } from 'zustand';

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  title: string;
  categoryId: string | null;
  startedAt: Date | null;
  pausedAt: Date | null;
  totalPausedMs: number;
  start: (title: string, categoryId?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => { startTime: Date; endTime: Date; title: string; categoryId: string | null };
  getElapsedMs: () => number;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  isPaused: false,
  title: '',
  categoryId: null,
  startedAt: null,
  pausedAt: null,
  totalPausedMs: 0,

  start: (title, categoryId) => {
    set({
      isRunning: true,
      isPaused: false,
      title,
      categoryId: categoryId ?? null,
      startedAt: new Date(),
      pausedAt: null,
      totalPausedMs: 0,
    });
  },

  pause: () => {
    set({ isPaused: true, pausedAt: new Date() });
  },

  resume: () => {
    const { pausedAt, totalPausedMs } = get();
    if (pausedAt) {
      set({
        isPaused: false,
        pausedAt: null,
        totalPausedMs: totalPausedMs + (Date.now() - pausedAt.getTime()),
      });
    }
  },

  stop: () => {
    const { startedAt, title, categoryId } = get();
    const endTime = new Date();
    const startTime = startedAt ?? endTime;

    set({
      isRunning: false,
      isPaused: false,
      title: '',
      categoryId: null,
      startedAt: null,
      pausedAt: null,
      totalPausedMs: 0,
    });

    return { startTime, endTime, title, categoryId };
  },

  getElapsedMs: () => {
    const { startedAt, isRunning, isPaused, pausedAt, totalPausedMs } = get();
    if (!startedAt || !isRunning) return 0;
    if (isPaused && pausedAt) {
      return pausedAt.getTime() - startedAt.getTime() - totalPausedMs;
    }
    return Date.now() - startedAt.getTime() - totalPausedMs;
  },
}));
