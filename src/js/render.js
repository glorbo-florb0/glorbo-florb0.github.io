import { $, esc, isRealUrl } from "./dom.js";
import { dateParts } from "./format.js";

const dateBlock = (iso) => {
  const d = dateParts(iso);
  return d
    ? `<div class="date"><b>${d.day}</b>${d.month}<br>${d.year}</div>`
    : `<div class="date"></div>`;
};

function renderHero(content) {
  $("who").innerHTML = content.who
    .map(([key, value]) => `<div>${esc(key)}: <b>${esc(value)}</b></div>`)
    .join("");
}

function renderFacts(content) {
  const skillCount = Object.values(content.skills).reduce((n, items) => n + items.length, 0);
  const facts = [
    [content.projects.length, "Projects documented"],
    [content.ctf.length, "CTF platforms"],
    [content.posts.length, "Writeups published"],
    [skillCount, "Tools and skills"],
  ];
  $("facts").innerHTML = facts
    .filter(([count]) => count > 0)
    .map(
      ([count, label]) =>
        `<div class="fact"><strong>${count}</strong><span>${esc(label)}</span></div>`,
    )
    .join("");
}

function renderSkills(content) {
  $("skillTiles").innerHTML = Object.entries(content.skills)
    .map(
      ([group, items]) => `
        <div class="tile">
          <div class="art"></div>
          <div class="in">
            <h3>${esc(group)}</h3>
            <ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          </div>
        </div>`,
    )
    .join("");
}

function card(item) {
  const linked = isRealUrl(item.url);
  const inner = `
    <div class="art"></div>
    <div class="in">
      <span class="tag">${esc(item.tag)}</span>
      <h3>${esc(item.t)}</h3>
      <p>${esc(item.d)}</p>
      ${linked ? '<span class="more">Read more</span>' : ""}
    </div>`;
  return linked
    ? `<a class="card" href="${esc(item.url)}" rel="noopener noreferrer">${inner}</a>`
    : `<div class="card">${inner}</div>`;
}

function renderCards(content) {
  $("projectGrid").innerHTML = content.projects.map(card).join("");
  $("ctfGrid").innerHTML = content.ctf.map(card).join("");
}

function renderAchievements(content) {
  $("achList").innerHTML = content.achievements
    .map((a) => {
      const when = a.date
        ? dateBlock(a.date)
        : `<div class="date"><b class="year-only">${esc(a.when ?? "")}</b></div>`;
      return `<li><div class="it">${when}<div><h3>${esc(a.t)}</h3><p>${esc(a.d)}</p></div></div></li>`;
    })
    .join("");
}

function renderPosts(content) {
  const hasPosts = content.posts.length > 0;
  $("blog").hidden = !hasPosts;
  $("blogCta").hidden = !hasPosts;
  document.querySelector('#links a[href="#blog"]').parentElement.hidden = !hasPosts;

  $("postList").innerHTML = content.posts
    .map((post) => {
      const body = `${dateBlock(post.date)}<div><h3>${esc(post.t)}</h3><p>${esc(post.d)}</p></div>`;
      return isRealUrl(post.url)
        ? `<li><a href="${esc(post.url)}" rel="noopener noreferrer">${body}</a></li>`
        : `<li><div class="it">${body}</div></li>`;
    })
    .join("");
}

function renderContact(content) {
  $("contactRows").innerHTML = content.contact
    .map(
      ([label, value]) => `
        <div class="row">
          <div><small>${esc(label)}</small>${esc(value)}</div>
          <button type="button" data-copy="${esc(value)}">Copy</button>
        </div>`,
    )
    .join("");

  $("socials").innerHTML = content.socials
    .filter(([, url]) => isRealUrl(url))
    .map(
      ([name, url]) => `<li><a href="${esc(url)}" rel="noopener noreferrer">${esc(name)}</a></li>`,
    )
    .join("");

  $("yr").textContent = new Date().getFullYear();
}

/** Render every dynamic section of the page from a content object. */
export function renderAll(content) {
  renderHero(content);
  renderFacts(content);
  renderSkills(content);
  renderCards(content);
  renderAchievements(content);
  renderPosts(content);
  renderContact(content);
}
