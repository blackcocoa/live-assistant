import { useState, useEffect } from "react";
import DurationPickerModal from "./DurationPickerModal.tsx";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSetlistStore } from "../stores/setlistStore";
import { useTrackPresetStore } from "../stores/trackPresetStore";
import { formatDuration, parseDuration } from "../utils";
import type { Setlist, Track, TrackPreset } from "../types";

interface Props {
  initial: Setlist;
  onDone: () => void;
  onCancel: () => void;
}

function newTrack(): Track {
  return { id: crypto.randomUUID(), name: "", durationSeconds: 0, gapSeconds: 60 };
}

interface PickerState {
  trackIndex: number;
  field: "durationSeconds" | "gapSeconds";
}

interface CardProps {
  track: Track;
  index: number;
  menuOpen: boolean;
  onUpdate: (patch: Partial<Track>) => void;
  onRemove: () => void;
  onMenuToggle: () => void;
  onSavePreset: () => void;
  onOpenPicker: (field: "durationSeconds" | "gapSeconds") => void;
}

function SortableTrackCard({ track, index, menuOpen, onUpdate, onRemove, onMenuToggle, onSavePreset, onOpenPicker }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="bg-surface rounded-[14px] p-3 flex items-center gap-2.5 relative"
      {...attributes}
    >
      <div
        {...listeners}
        className="text-muted text-[20px] w-5 flex items-center justify-center shrink-0 touch-none cursor-grab"
      >
        ≡
      </div>
      <span className="text-[13px] text-muted w-5 text-center shrink-0">{index + 1}</span>
      <div className="flex-1 flex flex-col gap-1.5">
        <input
          className="w-full bg-primary rounded-lg px-3 py-2 text-[15px] text-white outline-none placeholder-muted"
          placeholder="曲名"
          value={track.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        <input
          className="w-full bg-primary rounded-lg px-3 py-2 text-[13px] text-white outline-none placeholder-muted"
          placeholder="メモ（任意）"
          value={track.memo ?? ""}
          onChange={(e) => onUpdate({ memo: e.target.value })}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenPicker("durationSeconds")}
            className="bg-primary rounded-lg px-3 py-2 text-[15px] text-white tabular-nums w-24 text-left active:opacity-70"
          >
            {formatDuration(track.durationSeconds)}
          </button>
          <span className="text-[12px] text-muted">分:秒</span>
          <span className="text-[12px] text-muted ml-1">gap</span>
          <button
            type="button"
            onClick={() => onOpenPicker("gapSeconds")}
            className="bg-primary rounded-lg px-3 py-2 text-[15px] text-white tabular-nums w-20 text-left active:opacity-70"
          >
            {formatDuration(track.gapSeconds ?? 60)}
          </button>
          <span className="text-[12px] text-muted">分:秒</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="text-muted text-[20px] w-9 h-9 flex items-center justify-center active:opacity-60"
        >
          ⋮
        </button>
        <button type="button" onClick={onRemove} className="text-danger text-[22px] w-9 h-9 flex items-center justify-center">−</button>
      </div>
      {menuOpen && (
        <div className="absolute top-2 right-12 z-50 bg-primary rounded-[12px] shadow-xl overflow-hidden min-w-[180px]" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onSavePreset}
            className="w-full px-4 py-3 text-[15px] text-left active:bg-surface transition-colors"
          >
            トラックプリセットに追加
          </button>
        </div>
      )}
    </div>
  );
}

export default function SetlistEditScreen({ initial, onDone, onCancel }: Props) {
  const { save } = useSetlistStore();
  const { save: savePreset, presets } = useTrackPresetStore();
  const [name, setName] = useState(initial.name);
  const [memo, setMemo] = useState(initial.memo);
  const [tracks, setTracks] = useState<Track[]>(
    initial.tracks.length ? initial.tracks : [newTrack()]
  );
  const [comboQuery, setComboQuery] = useState("");
  const [comboOpen, setComboOpen] = useState(false);
  const [trackMenuIndex, setTrackMenuIndex] = useState<number | null>(null);
  const [pickerState, setPickerState] = useState<PickerState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(id);
  }, [toast]);

  const filteredPresets = presets.filter((p) =>
    p.name.toLowerCase().includes(comboQuery.toLowerCase())
  );

  function updateTrack(index: number, patch: Partial<Track>) {
    setTracks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function removeTrack(index: number) {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  }

  function addTrack(preset?: TrackPreset) {
    const track = preset
      ? { id: crypto.randomUUID(), name: preset.name, durationSeconds: preset.durationSeconds, gapSeconds: 60, appleMusicUrl: preset.appleMusicUrl, spotifyUrl: preset.spotifyUrl }
      : newTrack();
    setTracks((prev) => [...prev, track]);
    setComboQuery("");
    setComboOpen(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tracks.findIndex((t) => t.id === active.id);
    const newIndex = tracks.findIndex((t) => t.id === over.id);
    setTracks((prev) => arrayMove(prev, oldIndex, newIndex));
  }

  function handleSave() {
    if (!name.trim()) return;
    save({ ...initial, name: name.trim(), memo: memo.trim(), tracks });
    onDone();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between bg-surface border-b border-sep px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 shrink-0">
        <div className="min-w-[60px]" />
        <h1 className="text-[17px] font-semibold flex-1 text-center">
          {initial.id ? "セットリスト編集" : "新規セットリスト"}
        </h1>
        <div className="min-w-[60px]" />
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

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {tracks.map((track, i) => (
                <SortableTrackCard
                  key={track.id}
                  track={track}
                  index={i}
                  menuOpen={trackMenuIndex === i}
                  onUpdate={(patch) => updateTrack(i, patch)}
                  onRemove={() => removeTrack(i)}
                  onMenuToggle={() => setTrackMenuIndex(trackMenuIndex === i ? null : i)}
                  onSavePreset={() => {
                    savePreset(track.name, track.durationSeconds);
                    setTrackMenuIndex(null);
                    setToast("プリセットに追加しました");
                  }}
                  onOpenPicker={(field) => setPickerState({ trackIndex: i, field })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          type="button"
          onClick={() => { setComboQuery(""); setComboOpen(true); }}
          className="w-full bg-surface rounded-[14px] py-3.5 text-accent text-[15px] font-semibold active:opacity-75 transition-opacity"
        >
          ＋ 曲を検索または追加
        </button>

        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 bg-surface rounded-[14px] py-3.5 text-muted text-[15px] active:opacity-75 transition-opacity">
            キャンセル
          </button>
          <button type="button" onClick={handleSave} disabled={!name.trim()} className="flex-[2] bg-accent rounded-[14px] py-3.5 text-black text-[15px] font-bold active:opacity-75 transition-opacity disabled:bg-primary disabled:text-muted">
            保存
          </button>
        </div>
      </div>

      {trackMenuIndex !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setTrackMenuIndex(null)} />
      )}

      {comboOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setComboOpen(false)}>
          <div
            className="absolute inset-x-0 top-0 bg-surface flex flex-col"
            style={{ height: "100dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 gap-3 border-b border-sep shrink-0 pt-[env(safe-area-inset-top,0px)]">
              <input
                type="text"
                autoFocus
                className="flex-1 bg-transparent text-white text-[15px] py-4 outline-none placeholder-muted"
                placeholder="曲を検索..."
                value={comboQuery}
                onChange={(e) => setComboQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addTrack(filteredPresets[0]); }}
              />
              <button type="button" onClick={() => setComboOpen(false)} className="text-accent text-[15px] shrink-0">
                キャンセル
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <button
                type="button"
                onClick={() => addTrack()}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-primary-active border-b border-sep"
              >
                <span className="text-accent text-[15px]">＋</span>
                <span className="text-[15px] text-muted">空のトラックを追加</span>
              </button>
              {filteredPresets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addTrack(p)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-primary-active border-b border-sep last:border-0"
                >
                  <span className="text-[15px] text-white truncate flex-1">{p.name}</span>
                  <span className="text-[13px] text-muted ml-3 shrink-0">{formatDuration(p.durationSeconds)}</span>
                </button>
              ))}
              {filteredPresets.length === 0 && comboQuery && (
                <p className="px-4 py-3.5 text-[14px] text-muted">一致するプリセットなし</p>
              )}
            </div>
          </div>
        </div>
      )}

      {pickerState && (
        <DurationPickerModal
          title={pickerState.field === "durationSeconds" ? "曲の長さ" : "曲間"}
          initialSeconds={tracks[pickerState.trackIndex][pickerState.field] ?? 60}
          onConfirm={(sec) => {
            updateTrack(pickerState.trackIndex, { [pickerState.field]: sec });
            setPickerState(null);
          }}
          onClose={() => setPickerState(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+24px)] left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-white/10 backdrop-blur-sm text-white text-[14px] px-5 py-2.5 rounded-full">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
