import { create } from "zustand";
import type { Setlist } from "../types";

const STORAGE_KEY = "live_assistant_setlists";

function load(): Setlist[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persist(setlists: Setlist[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(setlists));
}

interface SetlistStore {
  setlists: Setlist[];
  save: (setlist: Setlist) => Setlist;
  remove: (id: string) => void;
}

export const useSetlistStore = create<SetlistStore>((set, get) => ({
  setlists: load(),

  save(setlist) {
    const isNew = !setlist.id;
    const saved = isNew ? { ...setlist, id: crypto.randomUUID() } : setlist;
    const setlists = isNew
      ? [...get().setlists, saved]
      : get().setlists.map((s) => (s.id === saved.id ? saved : s));
    persist(setlists);
    set({ setlists });
    return saved;
  },

  remove(id) {
    const setlists = get().setlists.filter((s) => s.id !== id);
    persist(setlists);
    set({ setlists });
  },
}));
