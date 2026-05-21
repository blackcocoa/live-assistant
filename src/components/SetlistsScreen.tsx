import { useState } from "react";
import { useSetlistStore } from "../stores/setlistStore";
import { useStopwatchStore } from "../stores/stopwatchStore";
import { formatDuration, totalDurationSec } from "../utils";
import type { Setlist } from "../types";

interface Props {
  onBack: () => void;
  onNew: () => void;
  onEdit: (setlist: Setlist) => void;
}

export default function SetlistsScreen({ onBack, onNew, onEdit }: Props) {
  const { setlists, remove } = useSetlistStore();
  const loadIntoSW = useStopwatchStore((s) => s.load);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleLoad(setlist: Setlist) {
    loadIntoSW(setlist);
    onBack();
  }

  function handleDelete() {
    if (!confirmDeleteId) return;
    remove(confirmDeleteId);
    setConfirmDeleteId(null);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between bg-surface border-b border-sep px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 shrink-0">
        <button onClick={onBack} className="text-accent text-[17px] min-w-[60px]">‹ 戻る</button>
        <h1 className="text-[17px] font-semibold flex-1 text-center">セットリスト</h1>
        <button onClick={onNew} className="text-accent text-[17px] min-w-[60px] text-right">新規</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        {setlists.length === 0 && (
          <p className="text-muted text-center py-16 text-[15px]">
            セットリストがありません<br />右上の「新規」から作成してください
          </p>
        )}
        {setlists.map((s) => (
          <div key={s.id} className="bg-surface rounded-[14px] overflow-hidden">
            <button
              onClick={() => handleLoad(s)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-surface2 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-semibold truncate">{s.name || "(名称未設定)"}</div>
                <div className="text-[13px] text-muted mt-0.5">
                  {s.tracks.length}曲 · {formatDuration(totalDurationSec(s.tracks))}
                </div>
              </div>
              <span className="text-muted text-[14px]">▶</span>
            </button>
            <div className="flex border-t border-sep">
              <button onClick={() => onEdit(s)} className="flex-1 py-3 text-accent text-[15px] active:bg-surface2 transition-colors">
                ✎ 編集
              </button>
              <div className="w-px bg-sep" />
              <button onClick={() => setConfirmDeleteId(s.id)} className="flex-1 py-3 text-danger text-[15px] active:bg-surface2 transition-colors">
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50 pb-[env(safe-area-inset-bottom,0px)]" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-surface w-full rounded-t-[14px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-muted text-[13px] py-4 border-b border-sep">このセットリストを削除しますか？</p>
            <button onClick={handleDelete} className="w-full py-4 text-danger text-[17px] border-b border-sep active:bg-surface2">削除</button>
            <button onClick={() => setConfirmDeleteId(null)} className="w-full py-4 text-accent text-[17px] font-bold mt-2 active:bg-surface2">キャンセル</button>
          </div>
        </div>
      )}
    </div>
  );
}
