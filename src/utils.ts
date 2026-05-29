export function formatTime(ms: number): string {
  const abs = Math.abs(ms);
  const totalSec = Math.floor(abs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const sign = ms < 0 ? "-" : "";
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${sign}${h}:${mm}:${ss}` : `${sign}${mm}:${ss}`;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function parseDuration(str: string): number {
  const t = str.trim();
  if (t.includes(":")) {
    const parts = t.split(":").map((v) => parseInt(v) || 0);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return (parseInt(t) || 0) * 60;
}

export function totalDurationSec(tracks: { durationSeconds: number; gapSeconds?: number }[]): number {
  return tracks.reduce((sum, t) => sum + t.durationSeconds + (t.gapSeconds ?? 60), 0);
}
