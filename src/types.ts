export interface Track {
  id: string;
  name: string;
  durationSeconds: number;
  gapSeconds?: number;
}

export interface Setlist {
  id: string;
  name: string;
  memo: string;
  tracks: Track[];
}

export interface TrackPreset {
  id: string;
  name: string;
  durationSeconds: number;
}

export type Screen = "main" | "setlists" | "editor" | "tracks" | "import";
