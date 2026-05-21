export interface Track {
  id: string;
  name: string;
  durationSeconds: number;
}

export interface Setlist {
  id: string;
  name: string;
  memo: string;
  tracks: Track[];
}

export type Screen = "main" | "setlists" | "editor";
