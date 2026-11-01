import { create } from 'zustand';

interface OnboardingState {
  step: number;
  name: string;
  goals: string[];
  selectedCategories: string[];
  wantsReminders: boolean;
  setStep: (step: number) => void;
  setName: (name: string) => void;
  toggleGoal: (goal: string) => void;
  toggleCategory: (category: string) => void;
  setWantsReminders: (value: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  step: 0,
  name: '',
  goals: [],
  selectedCategories: [],
  wantsReminders: true,

  setStep: (step) => set({ step }),
  setName: (name) => set({ name }),
  toggleGoal: (goal) => {
    const { goals } = get();
    set({
      goals: goals.includes(goal)
        ? goals.filter((g) => g !== goal)
        : [...goals, goal],
    });
  },
  toggleCategory: (category) => {
    const { selectedCategories } = get();
    set({
      selectedCategories: selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category],
    });
  },
  setWantsReminders: (value) => set({ wantsReminders: value }),
  reset: () => set({
    step: 0,
    name: '',
    goals: [],
    selectedCategories: [],
    wantsReminders: true,
  }),
}));
