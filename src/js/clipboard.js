import { $ } from "./dom.js";

function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand("copy");
  } finally {
    area.remove();
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to the legacy path */
    }
  }
  return fallbackCopy(text);
}

/** Wire up the "Copy" buttons in the contact list (event delegation, call once). */
export function initCopyButtons() {
  $("contactRows").addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-copy]");
    if (!button) return;
    if (await copyText(button.dataset.copy)) {
      button.textContent = "Copied";
      setTimeout(() => (button.textContent = "Copy"), 1400);
    }
  });
}
