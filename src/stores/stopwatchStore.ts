import { create } from "zustand";
import type { Setlist } from "../types";

interface StopwatchState {
  setlist: Setlist | null;
  trackIndex: number;
  isRunning: boolean;
  elapsedMs: number;
  startTs: number | null;
}

interface StopwatchActions {
  load: (setlist: Setlist) => void;
  clear: () => void;
  start: () => void;
  pause: () => void;
  lap: () => void;
  reset: () => void;
}

export const useStopwatchStore = create<StopwatchState & StopwatchActions>(
  (set, get) => {
    function snapshot(): number {
      const { elapsedMs, startTs } = get();
      return startTs ? elapsedMs + (Date.now() - startTs) : elapsedMs;
    }

    return {
      setlist: null,
      trackIndex: 0,
      isRunning: false,
      elapsedMs: 0,
      startTs: null,

      load(setlist) {
        set({ setlist, trackIndex: 0, isRunning: false, elapsedMs: 0, startTs: null });
      },

      clear() {
        set({ setlist: null, trackIndex: 0, isRunning: false, elapsedMs: 0, startTs: null });
      },

      start() {
        const { isRunning, setlist } = get();
        if (isRunning || !setlist?.tracks.length) return;
        set({ isRunning: true, startTs: Date.now() });
      },

      pause() {
        if (!get().isRunning) return;
        set({ isRunning: false, elapsedMs: snapshot(), startTs: null });
      },

      lap() {
        const { setlist, trackIndex } = get();
        if (!setlist || trackIndex >= setlist.tracks.length - 1) return;
        set({ trackIndex: trackIndex + 1 });
      },

      reset() {
        set({ isRunning: false, elapsedMs: 0, startTs: null, trackIndex: 0 });
      },
    };
  }
);

// 残り時間 = 最初から現在トラックまでの合計秒数 - 経過時間
export function selectRemainingMs(state: StopwatchState): number {
  const { setlist, trackIndex, elapsedMs, isRunning, startTs } = state;
  if (!setlist) return 0;
  const elapsed = isRunning && startTs ? elapsedMs + (Date.now() - startTs) : elapsedMs;
  const cumulative = setlist.tracks
    .slice(0, trackIndex + 1)
    .reduce((sum, t, i) => sum + (t.durationSeconds + (i < trackIndex ? (t.gapSeconds ?? 60) : 0)) * 1000, 0);
  return cumulative - elapsed;
}

export function selectTotalElapsedMs(state: StopwatchState): number {
  const { elapsedMs, isRunning, startTs } = state;
  return isRunning && startTs ? elapsedMs + (Date.now() - startTs) : elapsedMs;
}
