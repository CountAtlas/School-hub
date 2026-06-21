const raw = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export function apiBase(): string {
  return raw.replace(/\/+$/, "");
}

export function apiUrl(path: string): string {
  return `${apiBase()}${path}`;
}
