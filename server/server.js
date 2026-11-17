"use strict";

const crypto = require("node:crypto");
const express = require("express");
const { MongoClient } = require("mongodb");
const seed = require("./seed-data.json");

const KEYS = Object.keys(seed);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const PORT = 3000;

const client = new MongoClient(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 });
let sections;

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Public, read-only: all site content as one object ({ who, skills, projects, ... }).
app.get("/api/content", async (_req, res) => {
  const docs = await sections.find({ _id: { $in: KEYS } }).toArray();
  res.json(Object.fromEntries(docs.map((d) => [d._id, d.data])));
});

// Admin only: replace one section. Requires "Authorization: Bearer <ADMIN_TOKEN>".
// This route is NOT proxied by nginx; it is only reachable from inside the "app" network
// (see docs/DOCKER-SECURITY.md and server/put-content.js).
app.put("/api/content/:key", async (req, res) => {
  const given = Buffer.from((req.get("authorization") || "").replace(/^Bearer /, ""));
  const want = Buffer.from(ADMIN_TOKEN);
  if (!ADMIN_TOKEN || given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
    return res.status(401).json({ error: "unauthorized" });
  }
  if (!KEYS.includes(req.params.key)) return res.status(404).json({ error: "unknown section" });
  await sections.updateOne({ _id: req.params.key }, { $set: { data: req.body } }, { upsert: true });
  res.json({ ok: true });
});

app.use((_req, res) => res.status(404).json({ error: "not found" }));

// Express 5 forwards rejected promises from async handlers here.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "server error" });
});

async function start() {
  await client.connect();
  sections = client.db("portfolio").collection("sections");
  // Insert starter content for any section that doesn't exist yet; never overwrites edits.
  for (const key of KEYS) {
    await sections.updateOne({ _id: key }, { $setOnInsert: { data: seed[key] } }, { upsert: true });
  }
  const server = app.listen(PORT, () => console.log(`api listening on :${PORT}`));

  const shutdown = () => server.close(() => client.close().finally(() => process.exit(0)));
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
