import { useState } from "react";
import { useTrackPresetStore } from "../stores/trackPresetStore";
import { formatDuration } from "../utils";
import type { TrackPreset } from "../types";

interface Props {
  onSelect: (preset: TrackPreset) => void;
  onClose: () => void;
}

export default function TrackPresetPickerModal({ onSelect, onClose }: Props) {
  const { presets, remove } = useTrackPresetStore();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
          <div className="w-12" />
          <h2 className="text-[17px] font-semibold">トラックプリセット</h2>
          <button type="button" onClick={onClose} className="text-muted text-[15px] w-12 text-right">閉じる</button>
        </div>

        <div className="overflow-y-auto pb-4">
          {presets.length === 0 ? (
            <p className="text-muted text-center py-12 text-[15px]">
              プリセットがありません<br />
              <span className="text-[13px]">曲の横の ☆ から保存できます</span>
            </p>
          ) : (
            presets.map((p) => (
              <div key={p.id} className="flex items-center border-b border-sep">
                <button
                  type="button"
                  onClick={() => { onSelect(p); onClose(); }}
                  className="flex-1 flex items-center gap-3 px-4 py-3.5 text-left active:bg-surface2 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[16px] font-medium truncate">{p.name || "(タイトルなし)"}</div>
                    <div className="text-[13px] text-muted mt-0.5">{formatDuration(p.durationSeconds)}</div>
                  </div>
                  <span className="text-accent text-[13px]">追加</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(p.id)}
                  className="px-4 py-3.5 text-danger text-[15px] active:bg-surface2 transition-colors shrink-0"
                >
                  削除
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50 pb-[env(safe-area-inset-bottom,0px)]" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-surface w-full rounded-t-[14px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-muted text-[13px] py-4 border-b border-sep">このプリセットを削除しますか？</p>
            <button type="button" onClick={() => { remove(confirmDeleteId); setConfirmDeleteId(null); }} className="w-full py-4 text-danger text-[17px] border-b border-sep active:bg-surface2">削除</button>
            <button type="button" onClick={() => setConfirmDeleteId(null)} className="w-full py-4 text-accent text-[17px] font-bold mt-2 active:bg-surface2">キャンセル</button>
          </div>
        </div>
      )}
    </div>
  );
}
