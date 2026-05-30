import { useState, useEffect } from "react";
import { handleCallback, createPlaylist, getToken, startAuth } from "./utils/spotify.ts";
import { useSetlistStore } from "./stores/setlistStore.ts";
import StopwatchPanel from "./components/StopwatchPanel.tsx";
import TrackList from "./components/TrackList.tsx";
import SetlistsScreen from "./components/SetlistsScreen.tsx";
import TrackPresetsScreen from "./components/TrackPresetsScreen.tsx";
import ImportScreen from "./components/ImportScreen.tsx";
import SetlistEditScreen from "./components/SetlistEditScreen.tsx";
import SetlistPickerModal from "./components/SetlistPickerModal.tsx";
import type { Screen, Setlist } from "./types.ts";

function emptySetlist(): Setlist {
  return { id: "", name: "", memo: "", tracks: [] };
}

function MenuOverlay({ showMenu, setShowMenu, setScreen }: {
  showMenu: boolean;
  setShowMenu: (v: boolean) => void;
  setScreen: (s: Screen) => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => setShowMenu(true)}
        className="fixed top-[calc(env(safe-area-inset-top,0px)+10px)] right-4 z-40 w-9 h-9 flex flex-col items-center justify-center gap-[5px] active:opacity-60"
      >
        <span className="w-5 h-[2px] bg-muted rounded-full" />
        <span className="w-5 h-[2px] bg-muted rounded-full" />
        <span className="w-5 h-[2px] bg-muted rounded-full" />
      </button>

      {showMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)}>
          <div
            className="absolute top-[calc(env(safe-area-inset-top,0px)+48px)] right-4 bg-surface rounded-[14px] overflow-hidden shadow-xl min-w-[180px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => { setShowMenu(false); setScreen("setlists"); }}
              className="w-full py-3.5 text-[16px] text-left px-4 border-b border-sep active:bg-surface2 transition-colors"
            >
              セットリスト
            </button>
            <button
              type="button"
              onClick={() => { setShowMenu(false); setScreen("tracks"); }}
              className="w-full py-3.5 text-[16px] text-left px-4 active:bg-surface2 transition-colors"
            >
              トラック
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("main");
  const [editing, setEditing] = useState<Setlist | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [spotifyToast, setSpotifyToast] = useState<{ ok: boolean; message: string } | null>(null);
  const { setlists } = useSetlistStore();

  useEffect(() => {
    if (!globalThis.location.search.includes("code=")) return;
    handleCallback().then(async (result) => {
      if (!result) return;
      const { token, pendingSetlistId } = result;
      const setlist = setlists.find((s) => s.id === pendingSetlistId);
      if (!setlist) return;
      try {
        const url = await createPlaylist(token, setlist.name || "セットリスト", setlist.tracks.map((t) => t.spotifyUrl));
        setSpotifyToast({ ok: true, message: "Spotifyにプレイリストを作成しました" });
        globalThis.open(url, "_blank");
      } catch {
        setSpotifyToast({ ok: false, message: "プレイリストの作成に失敗しました" });
      }
      setScreen("setlists");
    });
  }, []);

  useEffect(() => {
    if (!spotifyToast) return;
    const id = setTimeout(() => setSpotifyToast(null), 4000);
    return () => clearTimeout(id);
  }, [spotifyToast]);

  async function handleExportSpotify(setlist: Setlist) {
    const token = getToken();
    if (!token) {
      startAuth(setlist.id);
      return;
    }
    try {
      const url = await createPlaylist(token, setlist.name || "セットリスト", setlist.tracks.map((t) => t.spotifyUrl));
      setSpotifyToast({ ok: true, message: "Spotifyにプレイリストを作成しました" });
      globalThis.open(url, "_blank");
    } catch (e) {
      if (e instanceof Error && e.message === "token_expired") {
        startAuth(setlist.id);
      } else {
        setSpotifyToast({ ok: false, message: "プレイリストの作成に失敗しました" });
      }
    }
  }

  function openEditor(setlist: Setlist) {
    setEditing(setlist);
    setScreen("editor");
  }

  const menu = <MenuOverlay showMenu={showMenu} setShowMenu={setShowMenu} setScreen={setScreen} />;

  const toast = spotifyToast && (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+24px)] left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div className={`text-white text-[14px] px-5 py-2.5 rounded-full ${spotifyToast.ok ? "bg-[#1DB954]/90" : "bg-danger/90"}`}>
        {spotifyToast.message}
      </div>
    </div>
  );

  if (screen === "tracks") {
    return <>{menu}<TrackPresetsScreen onBack={() => setScreen("main")} onImport={() => setScreen("import")} /></>;
  }

  if (screen === "import") {
    return <>{menu}<ImportScreen onBack={() => setScreen("tracks")} /></>;
  }

  if (screen === "setlists") {
    return (
      <>
        {menu}
        {toast}
        <SetlistsScreen
          onBack={() => setScreen("main")}
          onNew={() => openEditor(emptySetlist())}
          onEdit={(s) => openEditor(s)}
          onExportSpotify={handleExportSpotify}
        />
      </>
    );
  }

  if (screen === "editor" && editing) {
    return (
      <>
        {menu}
        <SetlistEditScreen
          initial={editing}
          onDone={() => setScreen("setlists")}
          onCancel={() => setScreen("setlists")}
        />
      </>
    );
  }

  return (
    <>
      {menu}
      <div className="flex flex-col h-full">
        <StopwatchPanel
          onOpenSetlists={() => setScreen("setlists")}
          onOpenPicker={() => setShowPicker(true)}
        />
        <div className="flex-1 min-h-0 pb-[env(safe-area-inset-bottom,0px)]">
          <TrackList onOpenPicker={() => setShowPicker(true)} />
        </div>
        {showPicker && (
          <SetlistPickerModal
            onClose={() => setShowPicker(false)}
            onManage={() => { setShowPicker(false); setScreen("setlists"); }}
          />
        )}
      </div>
    </>
  );
}
