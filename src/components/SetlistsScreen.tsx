import { useState } from "react";
import { useSetlistStore } from "../stores/setlistStore";
import { useStopwatchStore } from "../stores/stopwatchStore";
import { formatDuration, totalDurationSec } from "../utils";
import type { Setlist } from "../types";

interface Props {
  onBack: () => void;
  onNew: () => void;
  onEdit: (setlist: Setlist) => void;
  onExportSpotify: (setlist: Setlist) => void;
  onExportAppleMusic: (setlist: Setlist) => void;
}

type ExportService = "spotify" | "appleMusic";

export default function SetlistsScreen({ onBack, onNew, onEdit, onExportSpotify, onExportAppleMusic }: Props) {
  const { setlists, remove } = useSetlistStore();
  const loadIntoSW = useStopwatchStore((s) => s.load);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [menuSetlist, setMenuSetlist] = useState<Setlist | null>(null);
  const [confirmExport, setConfirmExport] = useState<{ setlist: Setlist; service: ExportService } | null>(null);

  function handleLoad(setlist: Setlist) {
    loadIntoSW(setlist);
    onBack();
  }

  function handleDelete() {
    if (!confirmDeleteId) return;
    remove(confirmDeleteId);
    setConfirmDeleteId(null);
  }

  function handleConfirmExport() {
    if (!confirmExport) return;
    const { setlist, service } = confirmExport;
    setConfirmExport(null);
    if (service === "spotify") onExportSpotify(setlist);
    else onExportAppleMusic(setlist);
  }

  const serviceLabel = (service: ExportService) =>
    service === "spotify" ? "Spotify" : "Apple Music";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between bg-surface border-b border-sep px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 shrink-0">
        <button type="button" onClick={onBack} className="text-accent text-[17px] min-w-[60px]">‹ 戻る</button>
        <h1 className="text-[17px] font-semibold flex-1 text-center">セットリスト</h1>
        <div className="min-w-[60px]" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        <button
          type="button"
          onClick={onNew}
          className="w-full bg-surface rounded-[14px] py-3.5 mb-10 text-accent text-[15px] font-semibold active:opacity-75 transition-opacity"
        >
          ＋ 新規
        </button>
        {setlists.length === 0 && (
          <p className="text-muted text-center py-16 text-[15px]">
            セットリストがありません
          </p>
        )}
        {setlists.map((s) => (
          <div key={s.id} className="bg-surface rounded-[14px] overflow-hidden">
            <div className="flex items-stretch">
              <button
                onClick={() => handleLoad(s)}
                className="flex-1 flex items-center gap-3 px-4 py-3.5 text-left active:bg-primary-active transition-colors min-w-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[17px] font-semibold truncate">{s.name || "(名称未設定)"}</div>
                  <div className="text-[13px] text-muted mt-0.5">
                    {s.tracks.length}曲 · {formatDuration(totalDurationSec(s.tracks))}
                  </div>
                </div>
                <span className="text-muted text-[14px] shrink-0">▶</span>
              </button>
              <button
                onClick={() => setMenuSetlist(s)}
                className="px-4 border-l border-sep text-muted text-[20px] leading-none active:bg-primary-active transition-colors shrink-0"
              >
                ···
              </button>
            </div>
            <div className="flex border-t border-sep">
              <button onClick={() => onEdit(s)} className="flex-1 py-3 text-accent text-[15px] active:bg-primary-active transition-colors">
                ✎ 編集
              </button>
              <div className="w-px bg-sep" />
              <button onClick={() => setConfirmDeleteId(s.id)} className="flex-1 py-3 text-danger text-[15px] active:bg-primary-active transition-colors">
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Export menu */}
      {menuSetlist && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50 pb-[env(safe-area-inset-bottom,0px)]" onClick={() => setMenuSetlist(null)}>
          <div className="bg-surface w-full rounded-t-[14px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-[13px] text-muted py-4 border-b border-sep px-4 truncate">
              {menuSetlist.name || "(名称未設定)"}
            </p>
            <button
              onClick={() => { setMenuSetlist(null); setConfirmExport({ setlist: menuSetlist, service: "spotify" }); }}
              className="w-full py-4 text-[17px] border-b border-sep active:bg-primary-active"
            >
              Spotifyプレイリストを作成する
            </button>
            <button
              onClick={() => { setMenuSetlist(null); setConfirmExport({ setlist: menuSetlist, service: "appleMusic" }); }}
              className="w-full py-4 text-[17px] border-b border-sep active:bg-primary-active"
            >
              Apple Musicプレイリストを作成する
            </button>
            <button onClick={() => setMenuSetlist(null)} className="w-full py-4 text-accent text-[17px] font-bold active:bg-primary-active">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Export confirmation */}
      {confirmExport && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50 pb-[env(safe-area-inset-bottom,0px)]" onClick={() => setConfirmExport(null)}>
          <div className="bg-surface w-full rounded-t-[14px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-[13px] text-muted py-4 border-b border-sep px-6">
              「{confirmExport.setlist.name || "セットリスト"}」のプレイリストを{serviceLabel(confirmExport.service)}に作成しますか？
            </p>
            <button onClick={handleConfirmExport} className="w-full py-4 text-accent text-[17px] border-b border-sep active:bg-primary-active">
              作成する
            </button>
            <button onClick={() => setConfirmExport(null)} className="w-full py-4 text-accent text-[17px] font-bold active:bg-primary-active">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50 pb-[env(safe-area-inset-bottom,0px)]" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-surface w-full rounded-t-[14px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-muted text-[13px] py-4 border-b border-sep">このセットリストを削除しますか？</p>
            <button onClick={handleDelete} className="w-full py-4 text-danger text-[17px] border-b border-sep active:bg-primary-active">削除</button>
            <button onClick={() => setConfirmDeleteId(null)} className="w-full py-4 text-accent text-[17px] font-bold active:bg-primary-active">キャンセル</button>
          </div>
        </div>
      )}
    </div>
  );
}
