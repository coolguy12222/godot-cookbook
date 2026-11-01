import { put, list, get, del } from "@vercel/blob";

const TYPES = ["bug", "feature", "question"];
const clip = (v, n) => String(v ?? "").trim().slice(0, n);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "POST") {
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if (b.website) return res.status(200).json({ ok: true }); // honeypot: bots fill hidden field
    const message = clip(b.message, 4000);
    if (message.length < 5) return res.status(400).json({ error: "Please describe it in a few more words." });
    const entry = {
      type: TYPES.includes(b.type) ? b.type : "bug",
      message,
      email: clip(b.email, 200),
      recipe: clip(b.recipe, 120) || "general",
      page: clip(b.page, 300),
      at: new Date().toISOString(),
      ua: clip(req.headers["user-agent"], 200),
    };
    await put(`feedback/${Date.now()}-${entry.type}.json`, JSON.stringify(entry), {
      access: "private", contentType: "application/json", addRandomSuffix: true,
    });
    return res.status(200).json({ ok: true });
  }

  // Everything below is the private inbox
  if (!process.env.ADMIN_KEY || req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Wrong admin key." });
  }

  if (req.method === "GET") {
    const { blobs } = await list({ prefix: "feedback/", limit: 1000 });
    const items = await Promise.all(blobs.map(async (bl) => {
      try {
        const r = await get(bl.url, { access: "private" });
        const data = JSON.parse(await new Response(r.stream).text());
        return { ...data, url: bl.url };
      } catch { return null; }
    }));
    return res.status(200).json({ items: items.filter(Boolean).sort((a, b) => b.at.localeCompare(a.at)) });
  }

  if (req.method === "DELETE") {
    const url = clip(req.query.url, 500);
    if (!url) return res.status(400).json({ error: "Missing url." });
    await del(url);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed." });
}
