import { useEffect, useRef } from "react";
import { useStopwatchStore } from "../stores/stopwatchStore";
import { formatDuration, totalDurationSec } from "../utils";

interface Props {
  onOpenPicker?: () => void;
}

export default function TrackList({ onOpenPicker }: Props) {
  const { setlist, trackIndex } = useStopwatchStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const el = currentRef.current;
    if (!container || !el) return;
    const elTop = el.offsetTop;
    const elBottom = elTop + el.offsetHeight;
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;
    const stopwatchHeight = (container.parentElement?.previousElementSibling as HTMLElement | null)?.clientHeight ?? 0;
    container.scrollTo({ top: elTop - (stopwatchHeight + 128), behavior: "smooth" });
  }, [trackIndex]);

  if (!setlist) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-16 gap-3 text-muted">
        <div className="text-5xl opacity-40">♪</div>
        <button
          type="button"
          onClick={onOpenPicker}
          className="text-[15px] text-center text-accent active:opacity-60"
        >
          セットリストを選択してください
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="flex justify-between items-center px-4 py-3 sticky top-0 bg-bg z-10">
        <span className="text-[13px] text-muted">
          Total {formatDuration(totalDurationSec(setlist.tracks))}
        </span>
      </div>

      {setlist.tracks.map((track, i) => {
        const isCurrent = i === trackIndex;
        const isLast = i === setlist.tracks.length - 1;
        const gap = track.gapSeconds ?? 60;
        return (
          <div key={track.id} ref={isCurrent ? currentRef : null}>
            <div className={`flex items-center px-4 py-3 gap-3 ${isCurrent ? "bg-accent-muted" : ""}`}>
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCurrent ? "bg-accent" : "invisible"}`} />
              <div className={`text-[13px] min-w-[22px] text-right tabular-nums ${isCurrent ? "text-accent" : "text-muted"}`}>
                {i + 1}
              </div>
              <div className={`flex-1 text-[32px] pb-1 pl-2 truncate leading-[1.1] ${isCurrent ? "text-accent font-bold" : "font-medium"}`}>
                {track.name || "(タイトルなし)"}
              </div>
              <div className={`text-[14px] tabular-nums shrink-0 ${isCurrent ? "text-accent" : "text-muted"}`}>
                {formatDuration(track.durationSeconds)}
              </div>
            </div>
            {!isLast && (
              <div className="flex items-center gap-2 px-6 py-1">
                <div className="flex-1 h-px bg-sep" />
                <span className="text-[13px] text-muted tabular-nums">{formatDuration(gap)}</span>
                <div className="flex-1 h-px bg-sep" />
              </div>
            )}
          </div>
        );
      })}

      {setlist.memo?.trim() && (
        <div className="mx-4 mt-2 mb-1 bg-surface rounded-[14px] p-4">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">メモ</div>
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{setlist.memo}</div>
        </div>
      )}
    </div>
  );
}
