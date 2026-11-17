import { describe, expect, it } from "vitest";
import { esc, isRealUrl } from "../src/js/dom.js";
import { dateParts } from "../src/js/format.js";
import content from "../src/data/content.json";

describe("esc", () => {
  it("escapes HTML-significant characters", () => {
    expect(esc(`<img src=x onerror="a('b')">&`)).toBe(
      "&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;",
    );
  });
  it("handles null and numbers", () => {
    expect(esc(null)).toBe("");
    expect(esc(42)).toBe("42");
  });
});

describe("isRealUrl", () => {
  it("accepts http, https and mailto", () => {
    expect(isRealUrl("https://github.com/x")).toBe(true);
    expect(isRealUrl("http://example.com")).toBe(true);
    expect(isRealUrl("mailto:a@b.co")).toBe(true);
  });
  it("rejects placeholders and dangerous schemes", () => {
    expect(isRealUrl("#")).toBe(false);
    expect(isRealUrl("")).toBe(false);
    expect(isRealUrl(undefined)).toBe(false);
    expect(isRealUrl("javascript:alert(1)")).toBe(false);
    expect(isRealUrl(" JaVaScRiPt:alert(1)")).toBe(false);
    expect(isRealUrl("data:text/html,hi")).toBe(false);
  });
});

describe("dateParts", () => {
  it("parses ISO dates", () => {
    expect(dateParts("2026-09-05")).toEqual({ day: "5", month: "Sep", year: "2026" });
  });
  it("returns null for bad input", () => {
    expect(dateParts("nope")).toBeNull();
    expect(dateParts("2026-13-01")).toBeNull();
  });
});

describe("content.json", () => {
  it("has every section the renderer needs", () => {
    for (const key of [
      "who",
      "skills",
      "projects",
      "ctf",
      "achievements",
      "posts",
      "contact",
      "socials",
    ]) {
      expect(content).toHaveProperty(key);
    }
  });
  it("only uses real URLs or the # placeholder", () => {
    for (const item of [...content.projects, ...content.ctf, ...content.posts]) {
      expect(item.url === "#" || isRealUrl(item.url)).toBe(true);
    }
  });
});
