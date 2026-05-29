import { useRef, useEffect } from "react";

interface Props {
  title?: string;
  initialSeconds: number;
  onConfirm: (seconds: number) => void;
  onClose: () => void;
}

const ITEM_H = 44;
const VISIBLE = 5;

interface DrumProps {
  items: number[];
  initial: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

function DrumColumn({ items, initial, containerRef }: DrumProps) {
  const dragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: initial * ITEM_H });
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    startY.current = e.clientY;
    startScrollTop.current = containerRef.current?.scrollTop ?? 0;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current || !containerRef.current) return;
    containerRef.current.scrollTop = startScrollTop.current - (e.clientY - startY.current);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div className="relative flex-1">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{ height: ITEM_H * 2, background: "linear-gradient(to bottom, var(--color-bg,#0d0d0d) 0%, transparent 100%)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{ height: ITEM_H * 2, background: "linear-gradient(to top, var(--color-bg,#0d0d0d) 0%, transparent 100%)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-2 z-10 rounded-[10px] bg-white/10"
        style={{ top: ITEM_H * 2, height: ITEM_H }}
      />
      <div
        ref={containerRef}
        className="overflow-y-scroll snap-y snap-mandatory"
        style={{ height: ITEM_H * VISIBLE, scrollbarWidth: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div style={{ height: ITEM_H * 2 }} />
        {items.map((v) => (
          <div
            key={v}
            className="snap-center flex items-center justify-center text-[28px] font-light tabular-nums select-none cursor-pointer"
            style={{ height: ITEM_H }}
            onClick={() => containerRef.current?.scrollTo({ top: v * ITEM_H, behavior: "smooth" })}
          >
            {String(v).padStart(2, "0")}
          </div>
        ))}
        <div style={{ height: ITEM_H * 2 }} />
      </div>
    </div>
  );
}

const MINUTES = Array.from({ length: 100 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

export default function DurationPickerModal({ title = "時間を設定", initialSeconds, onConfirm, onClose }: Props) {
  const minRef = useRef<HTMLDivElement>(null);
  const secRef = useRef<HTMLDivElement>(null);

  const initMin = Math.floor(initialSeconds / 60);
  const initSec = initialSeconds % 60;

  function handleConfirm() {
    const min = Math.round((minRef.current?.scrollTop ?? 0) / ITEM_H);
    const sec = Math.round((secRef.current?.scrollTop ?? 0) / ITEM_H);
    onConfirm(Math.max(0, min) * 60 + Math.max(0, sec));
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end z-50 pb-[env(safe-area-inset-bottom,0px)]"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full rounded-t-[20px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-sep">
          <button type="button" onClick={onClose} className="text-muted text-[15px] min-w-[60px]">
            キャンセル
          </button>
          <span className="text-[17px] font-semibold">{title}</span>
          <button type="button" onClick={handleConfirm} className="text-accent text-[15px] font-bold min-w-[60px] text-right">
            完了
          </button>
        </div>
        <div className="flex items-center px-6 py-2">
          <DrumColumn items={MINUTES} initial={initMin} containerRef={minRef} />
          <span className="text-[28px] font-light px-2 pb-1">:</span>
          <DrumColumn items={SECONDS} initial={initSec} containerRef={secRef} />
        </div>
        <div className="flex justify-center gap-8 pb-3 text-[13px] text-muted">
          <span className="flex-1 text-center">分</span>
          <span className="w-6" />
          <span className="flex-1 text-center">秒</span>
        </div>
      </div>
    </div>
  );
}
