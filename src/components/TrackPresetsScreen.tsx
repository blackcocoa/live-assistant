import { useState } from "react";
import { useTrackPresetStore } from "../stores/trackPresetStore";
import { formatDuration, parseDuration } from "../utils";
import type { TrackPreset } from "../types";
import SpotifyArtistImportModal from "./SpotifyArtistImportModal.tsx";

interface Props {
  onBack: () => void;
  onImport: () => void;
}

export default function TrackPresetsScreen({ onBack, onImport }: Props) {
  const { presets, save, remove, clear } = useTrackPresetStore();
  const [editing, setEditing] = useState<{ id: string | null; name: string; duration: string; appleMusicUrl: string; spotifyUrl: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showArtistImport, setShowArtistImport] = useState(false);

  function openNew() {
    setEditing({ id: null, name: "", duration: "3:00", appleMusicUrl: "", spotifyUrl: "" });
  }

  function openEdit(p: TrackPreset) {
    setEditing({ id: p.id, name: p.name, duration: formatDuration(p.durationSeconds), appleMusicUrl: p.appleMusicUrl ?? "", spotifyUrl: p.spotifyUrl ?? "" });
  }

  function handleSave() {
    if (!editing || !editing.name.trim()) return;
    const durationSeconds = parseDuration(editing.duration);
    if (editing.id) remove(editing.id);
    save(editing.name.trim(), durationSeconds, {
      appleMusicUrl: editing.appleMusicUrl.trim() || undefined,
      spotifyUrl: editing.spotifyUrl.trim() || undefined,
    });
    setEditing(null);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between bg-surface border-b border-sep px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 shrink-0">
        <button type="button" onClick={onBack} className="text-accent text-[17px] min-w-[60px]">‹ 戻る</button>
        <h1 className="text-[17px] font-semibold flex-1 text-center">トラックプリセット</h1>
        <div className="min-w-[60px]" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        <div className="flex gap-2 mb-10">
          <button type="button" onClick={openNew} className="flex-1 bg-surface rounded-[14px] py-3.5 text-accent text-[15px] font-semibold active:opacity-75 transition-opacity">
            ＋ 新規トラックプリセット
          </button>
          <div className="relative">
            <button type="button" onClick={() => setShowActionMenu(true)} className="h-full px-5 bg-surface rounded-[14px] text-[#ffffff] font-bold text-[26px] leading-none active:opacity-75 transition-opacity">
              ⋮
            </button>
            {showActionMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowActionMenu(false)} />
                <div className="absolute top-full right-0 mt-1 bg-surface rounded-[12px] overflow-hidden shadow-xl min-w-[160px] z-50">
                  <button
                    type="button"
                    onClick={() => { setShowActionMenu(false); setShowArtistImport(true); }}
                    className="w-full py-3.5 text-[15px] text-left px-4 border-b border-sep active:bg-primary-active transition-colors"
                  >
                    Spotifyから読み込む
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowActionMenu(false); onImport(); }}
                    className="w-full py-3.5 text-[15px] text-left px-4 border-b border-sep active:bg-primary-active transition-colors"
                  >
                    JSONを読み込む
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowActionMenu(false); setConfirmClearAll(true); }}
                    className="w-full py-3.5 text-[15px] text-left px-4 text-danger active:bg-primary-active transition-colors"
                  >
                    全て消去
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        {presets.length === 0 && (
          <p className="text-muted text-center py-16 text-[15px]">
            トラックプリセットがありません
            <span className="text-[13px] block mt-3 mb-4 leading-relaxed">
              曲名・演奏時間・配信URLをプリセットとして登録しておくと、<br />
              セットリスト編集時に素早くトラックを追加できます。
            </span>
            <span className="text-[13px] block mt-3 mb-4 leading-relaxed">
              セットリストに登録済みのトラックからプリセットを作成することもできます。
            </span>
            <button type="button" onClick={openNew} className="flex-1 pr-5 text-accent active:opacity-75 transition-opacity">
              ＋ 新規作成
            </button>
          </p>
        )}
        {presets.map((p) => (
          <div key={p.id} className="bg-surface rounded-[14px] flex">
            <div className="flex-1 flex items-center px-4 py-2 gap-3">
              <div className="flex-1 min-w-0">
                <b className="text-[17px] font-semibold truncate">{p.name || "(名称未設定)"}</b>
                <i className="not-italic text-[17px] mt-0.5 ml-2">({formatDuration(p.durationSeconds)})</i>
              </div>
            </div>
            <div className="w-px bg-sep" />
            <button onClick={() => openEdit(p)} className="flex-0 w-20 py-2 text-accent text-[22px] active:bg-primary-active transition-colors">
              ✎
            </button>
            <div className="w-px bg-sep" />
            <button onClick={() => setConfirmDeleteId(p.id)} className="flex-0 w-20 py-2 text-danger text-[26px] active:bg-primary-active transition-colors">
              ×
            </button>
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
              <div className="bg-primary rounded-[12px] overflow-hidden">
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
                <div className="flex items-center px-4 border-b border-sep min-h-[48px]">
                  <label className="text-[14px] text-muted w-14 shrink-0">時間</label>
                  <input
                    className="flex-1 bg-transparent text-white text-[15px] py-3 outline-none placeholder-muted tabular-nums"
                    placeholder="3:30"
                    value={editing.duration}
                    onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                  />
                  <span className="text-[13px] text-muted">分:秒</span>
                </div>
                <div className="flex items-start px-4 min-h-[48px]">
                  <label className="text-[14px] text-muted w-14 shrink-0 pt-3">URL</label>
                  <div className="flex-1 flex flex-col py-2 gap-2">
                    <input
                      className="w-full bg-transparent text-white text-[13px] py-1.5 px-2 outline-none placeholder-muted border border-sep rounded-lg"
                      placeholder="Apple Music"
                      value={editing.appleMusicUrl}
                      onChange={(e) => setEditing({ ...editing, appleMusicUrl: e.target.value })}
                    />
                    <input
                      className="w-full bg-transparent text-white text-[13px] py-1.5 px-2 outline-none placeholder-muted border border-sep rounded-lg"
                      placeholder="Spotify"
                      value={editing.spotifyUrl}
                      onChange={(e) => setEditing({ ...editing, spotifyUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmClearAll && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50 pb-[env(safe-area-inset-bottom,0px)]" onClick={() => setConfirmClearAll(false)}>
          <div className="bg-surface w-full rounded-t-[14px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-muted text-[13px] py-4 border-b border-sep">全てのプリセットを削除します。よろしいですか？<br />この操作は取り消せません。</p>
            <button type="button" onClick={() => { clear(); setConfirmClearAll(false); }} className="w-full py-4 text-danger text-[17px] border-b border-sep active:bg-primary-active">全て削除</button>
            <button type="button" onClick={() => setConfirmClearAll(false)} className="w-full py-4 text-accent text-[17px] font-bold mt-2 active:bg-primary-active">キャンセル</button>
          </div>
        </div>
      )}

      {showArtistImport && (
        <SpotifyArtistImportModal onClose={() => setShowArtistImport(false)} />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50 pb-[env(safe-area-inset-bottom,0px)]" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-surface w-full rounded-t-[14px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-muted text-[13px] py-4 border-b border-sep">このプリセットを削除しますか？</p>
            <button type="button" onClick={() => { remove(confirmDeleteId); setConfirmDeleteId(null); }} className="w-full py-4 text-danger text-[17px] border-b border-sep active:bg-primary-active">削除</button>
            <button type="button" onClick={() => setConfirmDeleteId(null)} className="w-full py-4 text-accent text-[17px] font-bold mt-2 active:bg-primary-active">キャンセル</button>
          </div>
        </div>
      )}
    </div>
  );
}
