/** Small DOM and string helpers shared by the render modules. */

export const $ = (id) => document.getElementById(id);

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escape text for safe use in HTML content and quoted attributes. */
export const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

/**
 * True when a URL is a real, safe link target.
 * "#" and empty values are placeholders; only http(s) and mailto links are allowed.
 */
export function isRealUrl(url) {
  if (typeof url !== "string") return false;
  const value = url.trim();
  if (value === "" || value === "#") return false;
  return /^(https?:\/\/|mailto:)/i.test(value);
}
