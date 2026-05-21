import { create } from "zustand";
import type { TrackPreset } from "../types";

const STORAGE_KEY = "live_assistant_track_presets";

function load(): TrackPreset[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persist(presets: TrackPreset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

interface TrackPresetStore {
  presets: TrackPreset[];
  save: (name: string, durationSeconds: number) => void;
  remove: (id: string) => void;
}

export const useTrackPresetStore = create<TrackPresetStore>((set, get) => ({
  presets: load(),

  save(name, durationSeconds) {
    const preset: TrackPreset = { id: crypto.randomUUID(), name, durationSeconds };
    const presets = [...get().presets, preset];
    persist(presets);
    set({ presets });
  },

  remove(id) {
    const presets = get().presets.filter((p) => p.id !== id);
    persist(presets);
    set({ presets });
  },
}));
