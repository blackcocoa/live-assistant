import { useState } from "react";
import { useTrackPresetStore } from "../stores/trackPresetStore";
import { formatDuration, parseDuration } from "../utils";
import type { TrackPreset } from "../types";

interface Props {
  onBack: () => void;
}

function emptyPreset(): Omit<TrackPreset, "id"> {
  return { name: "", durationSeconds: 180 };
}

export default function TrackPresetsScreen({ onBack }: Props) {
  const { presets, save, remove } = useTrackPresetStore();
  const [editing, setEditing] = useState<{ id: string | null; name: string; duration: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function openNew() {
    setEditing({ id: null, name: "", duration: "3:00" });
  }

  function openEdit(p: TrackPreset) {
    setEditing({ id: p.id, name: p.name, duration: formatDuration(p.durationSeconds) });
  }

  function handleSave() {
    if (!editing || !editing.name.trim()) return;
    const durationSeconds = parseDuration(editing.duration);
    if (editing.id) {
      // update existing by remove + re-save with same id not possible in current store
      // so remove old and save new with same position — simplest: just save new
      remove(editing.id);
    }
    save(editing.name.trim(), durationSeconds);
    setEditing(null);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between bg-surface border-b border-sep px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 shrink-0">
        <button onClick={onBack} className="text-accent text-[17px] min-w-[60px]">‹ 戻る</button>
        <h1 className="text-[17px] font-semibold flex-1 text-center">トラックプリセット</h1>
        <button onClick={openNew} className="text-accent text-[17px] min-w-[60px] text-right">新規</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        {presets.length === 0 && (
          <p className="text-muted text-center py-16 text-[15px]">
            プリセットがありません<br />右上の「新規」から追加してください
          </p>
        )}
        {presets.map((p) => (
          <div key={p.id} className="bg-surface rounded-[14px] overflow-hidden">
            <div className="flex items-center px-4 py-3.5 gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-semibold truncate">{p.name || "(名称未設定)"}</div>
                <div className="text-[13px] text-muted mt-0.5">{formatDuration(p.durationSeconds)}</div>
              </div>
            </div>
            <div className="flex border-t border-sep">
              <button onClick={() => openEdit(p)} className="flex-1 py-3 text-accent text-[15px] active:bg-surface2 transition-colors">
                ✎ 編集
              </button>
              <div className="w-px bg-sep" />
              <button onClick={() => setConfirmDeleteId(p.id)} className="flex-1 py-3 text-danger text-[15px] active:bg-surface2 transition-colors">
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setEditing(null)}>
          <div className="bg-surface w-full rounded-[20px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-sep">
              <button type="button" onClick={() => setEditing(null)} className="text-muted text-[15px]">キャンセル</button>
              <h2 className="text-[17px] font-semibold">{editing.id ? "プリセット編集" : "新規プリセット"}</h2>
              <button type="button" onClick={handleSave} disabled={!editing.name.trim()} className="text-accent text-[15px] font-bold disabled:text-muted">保存</button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="bg-surface2 rounded-[12px] overflow-hidden">
                <div className="flex items-center px-4 border-b border-sep min-h-[48px]">
                  <label className="text-[14px] text-muted w-14 shrink-0">曲名</label>
                  <input
                    autoFocus
                    className="flex-1 bg-transparent text-white text-[15px] py-3 outline-none placeholder-muted"
                    placeholder="曲名"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </div>
                <div className="flex items-center px-4 min-h-[48px]">
                  <label className="text-[14px] text-muted w-14 shrink-0">時間</label>
                  <input
                    className="flex-1 bg-transparent text-white text-[15px] py-3 outline-none placeholder-muted tabular-nums"
                    placeholder="3:30"
                    value={editing.duration}
                    onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                  />
                  <span className="text-[13px] text-muted">分:秒</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
