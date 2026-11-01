import { create } from 'zustand';

import * as taskService from '@/services/tasks';
import type { Task, TaskFormData } from '@/types';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (userId: string, data: TaskFormData) => Promise<Task>;
  update: (id: string, data: Partial<TaskFormData & { status: string }>) => Promise<Task>;
  remove: (id: string) => Promise<void>;
  complete: (id: string) => Promise<Task>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskService.fetchTasks();
      set({ tasks, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  create: async (userId, data) => {
    const task = await taskService.createTask(userId, data);
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  update: async (id, data) => {
    const task = await taskService.updateTask(id, data);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? task : t)),
    }));
    return task;
  },

  remove: async (id) => {
    await taskService.deleteTask(id);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  complete: async (id) => {
    const task = await taskService.completeTask(id);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? task : t)),
    }));
    return task;
  },
}));
