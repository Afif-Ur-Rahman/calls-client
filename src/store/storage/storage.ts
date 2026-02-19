import { StateStorage } from "zustand/middleware";

export const zustandStorage: StateStorage = {
  getItem: async (name: string) => {
    return localStorage.getItem(name);
  },
  setItem: async (name: string, value: string) => {
    return localStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    return localStorage.removeItem(name);
  },
};
