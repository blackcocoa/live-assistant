export interface Track {
  id: string;
  name: string;
  durationSeconds: number;
  gapSeconds?: number;
  memo?: string;
  appleMusicUrl?: string;
  spotifyUrl?: string;
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
  appleMusicUrl?: string;
  spotifyUrl?: string;
}

export type Screen = "main" | "setlists" | "editor" | "tracks" | "import";
