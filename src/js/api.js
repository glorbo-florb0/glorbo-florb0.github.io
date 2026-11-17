import fallback from "../data/content.json";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TIMEOUT_MS = 4000;

/**
 * Load site content.
 * - Static hosting (GitHub Pages): no API configured, so the bundled content.json is used.
 * - Self-hosted: VITE_API_URL points at the API, which overrides the bundled content.
 *   If the API is slow, down, or returns junk, the bundled content is used instead.
 */
export async function loadContent() {
  if (!API_URL) return fallback;

  try {
    const res = await fetch(`${API_URL}/content`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return fallback;
    const remote = await res.json();
    return { ...fallback, ...remote };
  } catch {
    return fallback;
  }
}
