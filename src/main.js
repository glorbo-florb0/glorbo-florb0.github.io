import "@fontsource/barlow-semi-condensed/latin-500.css";
import "@fontsource/barlow-semi-condensed/latin-600.css";
import "@fontsource/barlow-semi-condensed/latin-700.css";
import "@fontsource/source-sans-3/latin-400.css";
import "@fontsource/source-sans-3/latin-600.css";
import "./styles/main.css";

import { loadContent } from "./js/api.js";
import { initCopyButtons } from "./js/clipboard.js";
import { initNav } from "./js/nav.js";
import { renderAll } from "./js/render.js";

async function init() {
  initNav();
  initCopyButtons();
  renderAll(await loadContent());
}

init();
