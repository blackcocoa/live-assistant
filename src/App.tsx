import { useState } from "react";
import StopwatchPanel from "./components/StopwatchPanel";
import TrackList from "./components/TrackList";
import SetlistsScreen from "./components/SetlistsScreen";
import TrackPresetsScreen from "./components/TrackPresetsScreen.tsx";
import ImportScreen from "./components/ImportScreen.tsx";
import SetlistEditScreen from "./components/SetlistEditScreen.tsx";
import SetlistPickerModal from "./components/SetlistPickerModal.tsx";
import type { Screen, Setlist } from "./types";

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

  function openEditor(setlist: Setlist) {
    setEditing(setlist);
    setScreen("editor");
  }

  const menu = <MenuOverlay showMenu={showMenu} setShowMenu={setShowMenu} setScreen={setScreen} />;

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
        <SetlistsScreen
          onBack={() => setScreen("main")}
          onNew={() => openEditor(emptySetlist())}
          onEdit={(s) => openEditor(s)}
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
        <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom,0px)]">
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
