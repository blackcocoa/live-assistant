declare global {
  interface Window {
    MusicKit: {
      configure(config: object): Promise<void>;
      getInstance(): {
        authorize(): Promise<string>;
        musicUserToken: string;
      };
    };
  }
}

const DEV_TOKEN = import.meta.env.VITE_APPLE_DEVELOPER_TOKEN as string;
const TOKEN_KEY = "apple_music_user_token";

async function loadMusicKit(): Promise<void> {
  if (window.MusicKit) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("MusicKit load failed")));
    document.head.appendChild(script);
  });
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function authorize(): Promise<string> {
  await loadMusicKit();
  await window.MusicKit.configure({
    developerToken: DEV_TOKEN,
    app: { name: "Live Assistant", build: "1.0" },
  });
  const music = window.MusicKit.getInstance();
  const userToken = await music.authorize();
  localStorage.setItem(TOKEN_KEY, userToken);
  return userToken;
}

export async function createPlaylist(
  userToken: string,
  name: string,
  trackUrls: (string | undefined)[],
  description?: string,
): Promise<string> {
  const trackIds = trackUrls
    .filter((u): u is string => !!u)
    .map((u) => u.match(/[?&]i=(\d+)/)?.[1] ?? null)
    .filter((id): id is string => !!id);

  const attributes: Record<string, string> = { name };
  if (description) attributes.description = description;

  const body: Record<string, unknown> = { attributes };
  if (trackIds.length > 0) {
    body.relationships = {
      tracks: { data: trackIds.map((id) => ({ id, type: "songs" })) },
    };
  }

  const res = await fetch("https://api.music.apple.com/v1/me/library/playlists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DEV_TOKEN}`,
      "Music-User-Token": userToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    throw new Error("token_expired");
  }
  if (!res.ok) throw new Error(`apple_music_error_${res.status}`);

  const data = await res.json();
  const id: string | undefined = data.data?.[0]?.id;
  return id ? `https://music.apple.com/library/playlist/${id}` : "https://music.apple.com";
}
