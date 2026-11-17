import { $ } from "./dom.js";

/** Mobile menu toggle and scroll-spy highlighting for the nav. */
export function initNav() {
  const menu = $("menu");
  const links = $("links");

  menu.addEventListener("click", () => {
    menu.setAttribute("aria-expanded", String(links.classList.toggle("open")));
  });

  links.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      links.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
    }
  });

  const navLinks = [...links.querySelectorAll("a")];
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of navLinks) {
          link.classList.toggle("on", link.hash === `#${entry.target.id}`);
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
}
