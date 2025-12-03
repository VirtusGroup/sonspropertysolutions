import { create } from 'zustand';
import { Service } from '@/types';
import { demoServices } from '@/lib/demoData';

interface AppState {
  // Services (static, from demo data)
  services: Service[];
}

export const useStore = create<AppState>()(() => ({
  services: demoServices,
}));
