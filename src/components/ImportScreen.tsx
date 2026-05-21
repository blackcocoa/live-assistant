import { useRef, useState } from "react";
import { useTrackPresetStore } from "../stores/trackPresetStore";

interface Props {
  onBack: () => void;
}

interface JsonItem {
  name: unknown;
  length: unknown;
}

function parseJson(text: string): { name: string; durationSeconds: number }[] {
  const json = JSON.parse(text);
  if (!json || !Array.isArray(json.items)) throw new Error("items が見つかりません");
  return (json.items as JsonItem[]).map((item, i) => {
    if (typeof item.name !== "string") throw new Error(`items[${i}].name が文字列ではありません`);
    if (typeof item.length !== "number") throw new Error(`items[${i}].length が数値ではありません`);
    return { name: item.name, durationSeconds: item.length };
  });
}

export default function ImportScreen({ onBack }: Props) {
  const { importPresets } = useTrackPresetStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonText, setJsonText] = useState("");
  const [result, setResult] = useState<{ ok: true; count: number } | { ok: false; message: string } | null>(null);

  function handleImport(text: string) {
    try {
      const items = parseJson(text);
      if (items.length === 0) throw new Error("インポートするアイテムがありません");
      importPresets(items);
      setResult({ ok: true, count: items.length });
      setJsonText("");
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : "不明なエラー" });
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      handleImport(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between bg-surface border-b border-sep px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 shrink-0">
        <button onClick={onBack} className="text-accent text-[17px] min-w-[60px]">‹ 戻る</button>
        <h1 className="text-[17px] font-semibold flex-1 text-center">インポート</h1>
        <div className="min-w-[60px]" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
        <div className="text-[13px] text-muted px-1">
          以下のフォーマットの JSON をテキストで貼り付けるか、ファイルを選択してください。
        </div>

        <div className="bg-surface rounded-[14px] p-3">
          <pre className="text-[12px] text-muted leading-relaxed whitespace-pre-wrap">{`{
  "items": [
    { "name": "曲名", "length": 239 }
  ]
}`}</pre>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-surface rounded-[14px] py-3.5 text-accent text-[15px] font-semibold w-full active:opacity-75 transition-opacity"
        >
          ファイルを選択
        </button>

        <div className="text-[13px] font-semibold text-muted uppercase tracking-wider px-1">または直接貼り付け</div>

        <textarea
          className="bg-surface rounded-[14px] p-4 text-white text-[13px] outline-none placeholder-muted resize-none min-h-[160px] leading-relaxed font-mono"
          placeholder='{ "items": [ ... ] }'
          value={jsonText}
          onChange={(e) => { setJsonText(e.target.value); setResult(null); }}
        />

        <button
          type="button"
          onClick={() => handleImport(jsonText)}
          disabled={!jsonText.trim()}
          className="bg-surface rounded-[14px] py-3.5 text-accent text-[15px] font-semibold w-full active:opacity-75 transition-opacity disabled:text-muted"
        >
          インポート
        </button>

        {result && (
          <div className={`rounded-[14px] px-4 py-3.5 text-[15px] ${result.ok ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"}`}>
            {result.ok ? `${result.count} 件をインポートしました` : `エラー: ${result.message}`}
          </div>
        )}
      </div>
    </div>
  );
}
