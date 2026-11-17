"use strict";

// Update one content section from inside the API container (the API is not published):
//   docker compose exec api node put-content.js <section> <file.json>
// The JSON file must be readable inside the container, e.g. pipe it in:
//   docker compose exec -T api node put-content.js projects - < projects.json
const fs = require("node:fs");

const [section, file] = process.argv.slice(2);
if (!section || !file) {
  console.error("usage: node put-content.js <section> <file.json | ->");
  process.exit(2);
}

const body = fs.readFileSync(file === "-" ? 0 : file, "utf8");
JSON.parse(body); // fail early on invalid JSON

fetch(`http://127.0.0.1:3000/api/content/${encodeURIComponent(section)}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
  },
  body,
})
  .then(async (res) => {
    console.log(res.status, await res.text());
    process.exit(res.ok ? 0 : 1);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
