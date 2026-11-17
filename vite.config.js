import { defineConfig } from "vite";

// Content-Security-Policy for the built site. GitHub Pages cannot send custom headers,
// so it is injected as a <meta> tag at build time (not in dev, where Vite needs inline code).
// When self-hosting, nginx also sends a stricter header version (see deploy/nginx).
const csp = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

export default defineConfig({
  base: "/",
  build: {
    target: "es2022",
    assetsInlineLimit: 0, // never inline assets as data: URIs (keeps the CSP strict)
    rollupOptions: {
      input: { main: "index.html", notFound: "404.html" },
    },
  },
  plugins: [
    {
      name: "inject-csp",
      apply: "build",
      transformIndexHtml: (html) =>
        html.replace(
          "<!-- CSP -->",
          `<meta http-equiv="Content-Security-Policy" content="${csp}" />`,
        ),
    },
  ],
});
