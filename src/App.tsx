import { useState } from "react";
import StopwatchPanel from "./components/StopwatchPanel";
import TrackList from "./components/TrackList";
import SetlistsScreen from "./components/SetlistsScreen";
import EditorScreen from "./components/EditorScreen";
import SetlistPickerModal from "./components/SetlistPickerModal.tsx";
import type { Screen, Setlist } from "./types";

function emptySetlist(): Setlist {
  return { id: "", name: "", memo: "", tracks: [] };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("main");
  const [editing, setEditing] = useState<Setlist | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  function openEditor(setlist: Setlist) {
    setEditing(setlist);
    setScreen("editor");
  }

  if (screen === "setlists") {
    return (
      <SetlistsScreen
        onBack={() => setScreen("main")}
        onNew={() => openEditor(emptySetlist())}
        onEdit={(s) => openEditor(s)}
      />
    );
  }

  if (screen === "editor" && editing) {
    return (
      <EditorScreen
        initial={editing}
        onDone={() => setScreen("setlists")}
        onCancel={() => setScreen("setlists")}
      />
    );
  }

  return (
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
          onManage={() => {
            setShowPicker(false);
            setScreen("setlists");
          }}
        />
      )}
    </div>
  );
}
