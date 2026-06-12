import { useState, useEffect, useRef } from "react";
import { getToken, searchArtists, getArtistTracks, startAuth } from "../utils/spotify.ts";
import { useTrackPresetStore } from "../stores/trackPresetStore.ts";

interface Props {
  onClose: () => void;
}

export default function SpotifyArtistImportModal({ onClose }: Props) {
  const token = getToken();
  const { importPresets } = useTrackPresetStore();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; imageUrl?: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<{ id: string; name: string; imageUrl?: string } | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [progress, setProgress] = useState("");
  const [fetchedTracks, setFetchedTracks] = useState<{ name: string; durationSeconds: number; spotifyUrl: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token || !query.trim() || query.trim().length < 2 || selectedArtist) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        setSuggestions(await searchArtists(token, query.trim()));
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query, token, selectedArtist]);

  function selectArtist(artist: { id: string; name: string; imageUrl?: string }) {
    setSelectedArtist(artist);
    setQuery(artist.name);
    setSuggestions([]);
    setFetchedTracks(null);
    setError(null);
  }

  async function handleFetch() {
    if (!token || !selectedArtist) return;
    setIsFetching(true);
    setError(null);
    setFetchedTracks(null);
    try {
      setFetchedTracks(await getArtistTracks(token, selectedArtist.id, setProgress));
    } catch (e) {
      setError(e instanceof Error ? e.message : "取得に失敗しました");
    } finally {
      setIsFetching(false);
      setProgress("");
    }
  }

  function handleImport() {
    if (!fetchedTracks) return;
    importPresets(fetchedTracks);
    onClose();
  }

  if (!token) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={onClose}>
        <div className="bg-surface w-full max-w-[640px] rounded-[20px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-sep">
            <button type="button" onClick={onClose} className="text-muted text-[15px]">キャンセル</button>
            <h2 className="text-[17px] font-semibold">Spotifyから読み込む</h2>
            <div className="min-w-[60px]" />
          </div>
          <div className="p-6 flex flex-col items-center gap-4">
            <p className="text-muted text-[15px] text-center">Spotifyアカウントへのログインが必要です</p>
            <button
              type="button"
              onClick={() => startAuth("__artist_import__")}
              className="bg-[#1DB954] text-white text-[15px] font-semibold px-6 py-3 rounded-full active:opacity-75 transition-opacity"
            >
              Spotifyにログイン
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-[640px] rounded-[20px] overflow-hidden flex flex-col"
        style={{ maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-sep shrink-0">
          <button type="button" onClick={onClose} className="text-muted text-[15px]">キャンセル</button>
          <h2 className="text-[17px] font-semibold">Spotifyから読み込む</h2>
          <button
            type="button"
            onClick={handleImport}
            disabled={!fetchedTracks}
            className="text-accent text-[15px] font-bold disabled:text-muted"
          >
            追加
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="bg-primary rounded-[12px] flex items-center px-4 min-h-[48px]">
            <input
              ref={inputRef}
              autoFocus
              className="flex-1 bg-transparent text-white text-[15px] py-3 outline-none placeholder-muted"
              placeholder="アーティスト名"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (selectedArtist) {
                  setSelectedArtist(null);
                  setFetchedTracks(null);
                }
              }}
            />
            {isSearching && <span className="text-muted text-[13px] shrink-0">検索中...</span>}
          </div>

          {suggestions.length > 0 && (
            <div className="bg-surface rounded-[12px] overflow-hidden border border-sep">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="w-full px-4 py-2.5 text-[15px] text-left border-b border-sep last:border-0 active:bg-primary-active transition-colors flex items-center gap-3"
                  onClick={() => selectArtist(s)}
                >
                  {s.imageUrl
                    ? <img src={s.imageUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                    : <div className="w-10 h-10 rounded bg-primary shrink-0" />
                  }
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          )}

          {selectedArtist && !isFetching && !fetchedTracks && (
            <button
              type="button"
              onClick={handleFetch}
              className="w-full bg-[#1DB954] text-white text-[15px] font-semibold py-3.5 rounded-[12px] active:opacity-75 transition-opacity"
            >
              {selectedArtist.name}の楽曲をすべて読み込む
            </button>
          )}

          {isFetching && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-muted text-[13px] text-center">{progress}</p>
            </div>
          )}

          {error && <p className="text-danger text-[13px] text-center">{error}</p>}

          {fetchedTracks && (
            <div className="bg-primary rounded-[12px] px-4 py-3">
              <p className="text-[15px]">
                <span className="font-semibold">{fetchedTracks.length}曲</span>
                <span className="text-muted">が見つかりました</span>
              </p>
              <p className="text-muted text-[13px] mt-1">「追加」を押すとトラックプリセットに追加されます</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
