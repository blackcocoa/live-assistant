import { useState } from "react";
import { useSetlistStore } from "../stores/setlistStore";
import { formatDuration, parseDuration } from "../utils";
import type { Setlist, Track } from "../types";

interface Props {
  initial: Setlist;
  onDone: () => void;
  onCancel: () => void;
}

function newTrack(): Track {
  return { id: crypto.randomUUID(), name: "", durationSeconds: 180 };
}

export default function EditorScreen({ initial, onDone, onCancel }: Props) {
  const { save } = useSetlistStore();
  const [name, setName] = useState(initial.name);
  const [memo, setMemo] = useState(initial.memo);
  const [tracks, setTracks] = useState<Track[]>(
    initial.tracks.length ? initial.tracks : [newTrack()]
  );

  function updateTrack(index: number, patch: Partial<Track>) {
    setTracks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function removeTrack(index: number) {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!name.trim()) return;
    save({ ...initial, name: name.trim(), memo: memo.trim(), tracks });
    onDone();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between bg-surface border-b border-sep px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 shrink-0">
        <button onClick={onCancel} className="text-accent text-[17px] min-w-[60px]">キャンセル</button>
        <h1 className="text-[17px] font-semibold flex-1 text-center">
          {initial.id ? "セットリスト編集" : "新規セットリスト"}
        </h1>
        <button onClick={handleSave} disabled={!name.trim()} className="text-accent text-[17px] font-bold min-w-[60px] text-right disabled:text-muted">
          保存
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        <div className="bg-surface rounded-[14px] overflow-hidden">
          <div className="flex items-center px-4 border-b border-sep min-h-[48px]">
            <label className="text-[15px] text-muted w-14 shrink-0">名前</label>
            <input
              className="flex-1 bg-transparent text-white text-[15px] py-3 outline-none placeholder-muted"
              placeholder="セットリスト名"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex items-start px-4 min-h-[48px]">
            <label className="text-[15px] text-muted w-14 shrink-0 pt-3">メモ</label>
            <textarea
              className="flex-1 bg-transparent text-white text-[15px] py-3 outline-none placeholder-muted resize-none min-h-[72px] leading-relaxed"
              placeholder="ライブのメモ（任意）"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>

        <div className="text-[13px] font-semibold text-muted uppercase tracking-wider px-1">曲目</div>

        <div className="flex flex-col gap-2">
          {tracks.map((track, i) => (
            <div key={track.id} className="bg-surface rounded-[14px] p-3 flex items-center gap-2.5">
              <span className="text-[13px] text-muted w-5 text-center shrink-0">{i + 1}</span>
              <div className="flex-1 flex flex-col gap-1.5">
                <input
                  className="w-full bg-surface2 rounded-lg px-3 py-2 text-[15px] text-white outline-none placeholder-muted"
                  placeholder="曲名"
                  value={track.name}
                  onChange={(e) => updateTrack(i, { name: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <input
                    className="bg-surface2 rounded-lg px-3 py-2 text-[15px] text-white outline-none placeholder-muted tabular-nums w-24"
                    placeholder="3:30"
                    defaultValue={formatDuration(track.durationSeconds)}
                    onBlur={(e) => updateTrack(i, { durationSeconds: parseDuration(e.target.value) })}
                  />
                  <span className="text-[12px] text-muted">分:秒</span>
                </div>
              </div>
              <button onClick={() => removeTrack(i)} className="text-danger text-[22px] w-9 h-9 flex items-center justify-center shrink-0">−</button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setTracks((prev) => [...prev, newTrack()])}
          className="bg-surface rounded-[14px] py-3.5 text-accent text-[15px] font-semibold w-full active:opacity-75 transition-opacity"
        >
          ＋ 曲を追加
        </button>
      </div>
    </div>
  );
}
