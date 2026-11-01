import { create } from 'zustand';

import * as categoryService from '@/services/categories';
import type { Category } from '@/types';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetch: (userId: string) => Promise<void>;
  create: (userId: string, data: Pick<Category, 'name' | 'icon' | 'color' | 'is_productive'>) => Promise<Category>;
  update: (id: string, data: Partial<Category>) => Promise<Category>;
  remove: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetch: async (userId) => {
    set({ loading: true, error: null });
    try {
      const categories = await categoryService.fetchCategories(userId);
      set({ categories, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  create: async (userId, data) => {
    const category = await categoryService.createCategory(userId, data);
    set((state) => ({ categories: [...state.categories, category] }));
    return category;
  },

  update: async (id, data) => {
    const category = await categoryService.updateCategory(id, data);
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? category : c)),
    }));
    return category;
  },

  remove: async (id) => {
    await categoryService.deleteCategory(id);
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },
}));
