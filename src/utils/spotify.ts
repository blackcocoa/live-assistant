const CLIENT_ID = "3345641453bf49bdaaa8d258b723eff4";
const SCOPES = "playlist-modify-public playlist-modify-private";

function redirectUri(): string {
  return window.location.origin + window.location.pathname;
}

function generateVerifier(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function startAuth(pendingSetlistId: string): Promise<void> {
  const verifier = generateVerifier();
  const challenge = await generateChallenge(verifier);
  const state = generateVerifier();
  sessionStorage.setItem("spotify_verifier", verifier);
  sessionStorage.setItem("spotify_pending_setlist", pendingSetlistId);
  sessionStorage.setItem("spotify_state", state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri(),
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
    show_dialog: "true",
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleCallback(): Promise<{ token: string; pendingSetlistId: string } | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return null;

  const verifier = sessionStorage.getItem("spotify_verifier");
  const pendingSetlistId = sessionStorage.getItem("spotify_pending_setlist") ?? "";
  const storedState = sessionStorage.getItem("spotify_state");
  if (!verifier) return null;
  if (!storedState || params.get("state") !== storedState) return null;

  history.replaceState({}, "", window.location.pathname);
  sessionStorage.removeItem("spotify_verifier");
  sessionStorage.removeItem("spotify_pending_setlist");
  sessionStorage.removeItem("spotify_state");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
      code_verifier: verifier,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(data.error_description ?? "token error");

  const token = data.access_token as string;
  localStorage.setItem("spotify_token", token);
  return { token, pendingSetlistId };
}

export function getToken(): string | null {
  return localStorage.getItem("spotify_token");
}

export function clearToken(): void {
  localStorage.removeItem("spotify_token");
}

async function apiFetch(token: string, path: string, options?: RequestInit) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...options?.headers as Record<string, string>,
  };
  if (options?.body) headers["Content-Type"] = "application/json";

  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    headers,
  });
  if (res.status === 401) {
    clearToken();
    throw new Error("token_expired");
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `HTTP ${res.status}`);
  }
  return data;
}

export async function createPlaylist(
  token: string,
  name: string,
  trackUrls: (string | undefined)[],
  description?: string,
): Promise<string> {
  const body: Record<string, unknown> = { name, public: true };
  if (description) body.description = description;
  const playlist = await apiFetch(token, "/me/playlists", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const playlistId: string = playlist.id;
  const playlistUrl: string = playlist.external_urls.spotify;

  const uris = trackUrls
    .filter((u): u is string => !!u)
    .map((u) => {
      const id = u.split("/track/")[1]?.split("?")[0];
      return id ? `spotify:track:${id}` : null;
    })
    .filter((u): u is string => !!u);

  if (uris.length > 0) {
    for (let i = 0; i < uris.length; i += 100) {
      await apiFetch(token, `/playlists/${playlistId}/items`, {
        method: "POST",
        body: JSON.stringify({ uris: uris.slice(i, i + 100) }),
      });
    }
  }

  return playlistUrl;
}
