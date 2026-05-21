import { useEffect, useReducer } from "react";
import {
  useStopwatchStore,
  selectTotalElapsedMs,
  selectRemainingMs,
} from "../stores/stopwatchStore";
import { formatTime, formatDuration, totalDurationSec } from "../utils";

interface Props {
  onOpenSetlists: () => void;
  onOpenPicker: () => void;
}

export default function StopwatchPanel({ onOpenSetlists, onOpenPicker }: Props) {
  const store = useStopwatchStore();
  const { setlist, trackIndex, isRunning } = store;

  const [, tick] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [isRunning]);

  const totalElapsed = selectTotalElapsedMs(store);
  const remaining = selectRemainingMs(store);
  const track = setlist?.tracks[trackIndex];
  const isLastTrack = !setlist || trackIndex >= setlist.tracks.length - 1;
  const setTimeSec = setlist ? totalDurationSec(setlist.tracks) : null;

  return (
    <div className="bg-surface px-5 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-5 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={setlist ? onOpenPicker : undefined}
          className={`text-[16px] text-muted truncate flex-1 text-left ${setlist ? "active:opacity-60" : ""}`}
        >
          {setlist ? setlist.name || "(名称未設定)" : ""}
        </button>
      </div>

      {/* Track info */}
      <div className="mb-4">

        {track ? (
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="text-[12px] text-muted">
                {track ? `Track ${trackIndex + 1} / ${setlist!.tracks.length}` : ""}
              </div>
              <div className="text-[36px] leading-[1.1] font-bold truncate text-white -mt-[5px]">
                {track.name || "(タイトルなし)"}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[10px] text-muted uppercase tracking-wider">Total</div>
              <span className="text-[36px] font-light tabular-nums text-muted leading-[1.1]">
                {setTimeSec !== null ? formatDuration(setTimeSec) : ""}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenPicker}
            className="text-[18px] text-muted leading-tight text-left active:opacity-70"
          >
            セットリストを選択してください
          </button>
        )}
      </div>

      {/* Times */}
      <div className="flex gap-5 mb-6 items-end">
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wider ">経過</div>
          <div className="text-[48px] leading-[1.1] font-extralight tabular-nums">
            {formatTime(totalElapsed)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wider ">残り</div>
          <div className={`text-[48px] leading-[1.1] font-bold tabular-nums ${remaining < 0 ? "text-danger" : "text-accent"
            }`}>
            {setlist ? formatTime(remaining) : "--:--"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2.5">
        <button
          onClick={isRunning ? store.pause : store.start}
          disabled={!setlist?.tracks.length}
          className={`h-[52px] rounded-[14px] text-[17px] font-bold flex items-center justify-center gap-1.5 active:opacity-75 transition-opacity
            ${isRunning
              ? "flex-1 bg-surface2 text-white disabled:text-muted"
              : "flex-[2] bg-accent text-black disabled:bg-surface2 disabled:text-muted"
            }`}
        >
          {isRunning ? "⏸ 一時停止" : totalElapsed > 0 ? "▶ 再開" : "▶ スタート"}
        </button>
        <button
          onClick={store.lap}
          disabled={!setlist || isLastTrack}
          className={`h-[52px] rounded-[14px] text-[17px] font-bold flex items-center justify-center gap-1.5 active:opacity-75 transition-opacity
            ${isRunning
              ? "flex-[2] bg-accent text-black disabled:bg-surface2 disabled:text-muted"
              : "flex-1 bg-surface2 text-white disabled:text-muted"
            }`}
        >
          ⏭ 次へ
        </button>
        <button
          onClick={store.reset}
          className="h-[52px] px-4 rounded-[14px] text-[17px] bg-surface2 text-white active:opacity-75 transition-opacity"
        >
          ↺
        </button>
      </div>
    </div>
  );
}
