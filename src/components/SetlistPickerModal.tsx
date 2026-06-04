import { useSetlistStore } from "../stores/setlistStore";
import { useStopwatchStore } from "../stores/stopwatchStore";
import { formatDuration, totalDurationSec } from "../utils";
import type { Setlist } from "../types";

interface Props {
  onClose: () => void;
  onManage: () => void;
}

export default function SetlistPickerModal({ onClose, onManage }: Props) {
  const { setlists } = useSetlistStore();
  const loadIntoSW = useStopwatchStore((s) => s.load);

  function handleSelect(setlist: Setlist) {
    loadIntoSW(setlist);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full rounded-[20px] overflow-hidden max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-sep shrink-0">
          <button onClick={onManage} className="text-accent text-[15px]">管理</button>
          <h2 className="text-[17px] font-semibold">セットリストを選択</h2>
          <button onClick={onClose} className="text-muted text-[15px]">閉じる</button>
        </div>

        <div className="overflow-y-auto pb-4">
          {setlists.length === 0 ? (
            <p className="text-muted text-center py-12 text-[15px]">
              セットリストがありません<br />
              <button onClick={onManage} className="text-accent mt-2 inline-block">
                管理画面から作成する
              </button>
            </p>
          ) : (
            setlists.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left border-b border-sep active:bg-primary-active transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[17px] font-semibold truncate">
                    {s.name || "(名称未設定)"}
                  </div>
                  <div className="text-[13px] text-muted mt-0.5">
                    {s.tracks.length}曲 · {formatDuration(totalDurationSec(s.tracks))}
                  </div>
                </div>
                <span className="text-accent text-[14px]">▶</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
