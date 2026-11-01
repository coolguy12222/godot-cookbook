import fs from "fs";
import crypto from "crypto";
const CHECKSUMS = {"public/assets/app.css": "ffbd6cf6d0ad0bc5", "public/assets/data.js": "4952bb308757639a", "public/assets/engine.js": "29656220333bd12d", "api/feedback.js": "7c3c3a7573299507"};
let bad = 0;
for (const [f, h] of Object.entries(CHECKSUMS)) { const t = fs.readFileSync(f,"utf8").replace(/\r/g,"").split("\n").map(l=>l.trimEnd()).join("\n").trim(); const got = crypto.createHash("sha256").update(t).digest("hex").slice(0,16); if (got !== h) { console.error("CHECKSUM MISMATCH:", f, "size", fs.statSync(f).size); bad++; } else console.log("ok", f); }
if (bad) process.exit(1);
const SITE = process.env.SITE || "https://gdscript-cookbook.vercel.app";
const src = fs.readFileSync("public/assets/data.js","utf8");
const { R, SETUP, MISTAKES, GETTING_STARTED } = new Function(src+";return {R,SETUP,MISTAKES,GETTING_STARTED};")();
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const slugOf = t => t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const out = (p, html) => { fs.mkdirSync("public/"+p,{recursive:true}); fs.writeFileSync(`public/${p}index.html`.replace("//","/"), html); };
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=Karla:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap">`;
function page({path, title, desc, body, page = {}, noindex = false, script = true, jsonld = ""}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}${path}">
${noindex?'<meta name="robots" content="noindex">':""}
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}${path}">
<meta name="theme-color" content="#1c1b22"><link rel="icon" href="/favicon.png">
${FONTS}<link rel="stylesheet" href="/assets/app.css">${jsonld}</head><body>
<div class="top"><div class="wrap">
  <a class="brand" href="/"><canvas id="logo" width="24" height="24" aria-hidden="true"></canvas>GDScript Cookbook</a>
  <nav class="toplinks" aria-label="Main"><a href="/">Recipes</a><a href="/feedback/">Feedback</a><a href="/about/">About</a>${path==="/"?'<button class="btn" type="button" id="gsBtn" aria-expanded="false" aria-controls="guide">Getting started</button>':""}</nav>
</div></div>
${body}
<footer><div class="wrap"><p>Pixel art: <a href="https://kenney.nl/assets/pixel-platformer" target="_blank" rel="noopener">Pixel Platformer by Kenney</a> (CC0). Godot is a trademark of the Godot Foundation; this site is not affiliated with it.</p><p><a href="/about/">About</a> · <a href="/privacy/">Privacy</a> · <a href="/feedback/">Report a bug or request a recipe</a></p></div></footer>
${script?`<script>window.PAGE=${JSON.stringify(page)};</script><script src="/assets/data.js" defer></script><script src="/assets/engine.js" defer></script>`:""}
</body></html>`;
}
const bar = `<div class="bar"><div class="wrap"><div class="search"><input id="q" type="search" placeholder="Search recipes, e.g. jump, save, inventory" aria-label="Search recipes"><span class="count" id="count"></span></div><div class="chips" id="chips" role="group" aria-label="Filter by category"></div></div></div>`;
// home
const homeStatic = R.map(r=>`<article class="recipe"><div class="rhead"><h2><a href="/recipes/${slugOf(r.title)}/">${esc(r.title)}</a></h2><div class="meta"><span class="tag node">${esc(r.node)}</span><span class="tag">${esc(r.cat)}</span></div></div><p class="desc">${esc(r.desc)}</p></article>`).join("\n");
out("", page({path:"/", title:"GDScript Cookbook: Godot 4 code recipes with live previews", desc:`${R.length} copy-ready Godot 4 GDScript recipes: movement, combat, AI, UI, saving and more, each with a playable preview, setup guide and common mistakes.`,
 body:`<section class="guide" id="guide" hidden><div class="wrap"><h2>New to Godot? Start here</h2><ol class="gsteps" id="gsteps"></ol></div></section>
<div class="banner"><canvas id="banner" aria-label="Animated pixel-art scene: a player runs past coins and enemies"></canvas></div>
<header><div class="wrap hero"><div><h1>GDScript Cookbook</h1><p class="lede">Copy-ready scripts for the systems almost every game needs. Every recipe has a playable preview, sliders that rewrite the <code>@export</code> values as you drag, a setup guide and a list of common mistakes.</p></div>
<div class="pills"><span class="pill"><b id="nrec">${R.length}</b> recipes</span><span class="pill">Godot <b>4.2+</b></span><span class="pill">Price <b>$0</b></span></div></div></header>
${bar}<main><div class="wrap" id="list">${homeStatic}</div></main>`}));
// recipes
for (const r of R) {
  const s = slugOf(r.title), S = SETUP[r.title], M = MISTAKES[r.title] || [];
  const desc = `${r.desc} Godot 4 GDScript with setup steps and fixes for common mistakes.`.slice(0,300);
  const jsonld = `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"HowTo","name":`${r.title} in Godot 4`,"description":r.desc,"step":S.steps.map((x,i)=>({"@type":"HowToStep","position":i+1,"text":x.split("\n")[0]}))})}</script>`;
  const stat = `<article class="recipe"><p class="desc">${esc(r.desc)}</p><pre><code>${esc(r.code)}</code></pre>
<div class="setup"><div><h4>Scene tree</h4><pre>${esc(S.tree)}</pre></div><div><h4>Steps</h4><ol>${S.steps.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></div><p class="runline"><b>Run it</b>${esc(S.run)}</p></div>
<div class="mistakes"><h3>Common mistakes</h3><ul>${M.map(([a,b])=>`<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join("")}</ul></div></article>`;
  out(`recipes/${s}/`, page({path:`/recipes/${s}/`, title:`${r.title} in Godot 4 (GDScript) | GDScript Cookbook`, desc, page:{slug:s}, jsonld,
    body:`<header><div class="wrap hero"><div><p class="crumb"><a href="/">Recipes</a> / ${esc(r.cat)}</p><h1>${esc(r.title)}</h1><p class="lede">${esc(r.desc)}</p></div><div class="pills"><span class="pill">${esc(r.node)}</span><span class="pill">Godot <b>4.2+</b></span></div></div></header>
${bar}<main><div class="wrap" id="list">${stat}</div></main>`}));
}
// feedback
out("feedback/", page({path:"/feedback/", title:"Feedback: report a bug or request a recipe | GDScript Cookbook", desc:"Found a recipe that doesn't work, or want a new one? Send a bug report or feature request.",
 body:`<main><div class="wrap prose"><h1>Feedback</h1><p>Found a recipe that doesn't work in your Godot version, a mistake in a setup guide, or want a recipe that isn't here yet? Send it below. Every message is read, and popular requests become new recipes.</p><p>To report a problem with one specific recipe, use the <b>Report a bug / suggest</b> button on that recipe's page.</p><div id="generalfb"></div></div></main>`}));
out("about/", page({path:"/about/", title:"About | GDScript Cookbook", desc:"What the GDScript Cookbook is and who makes it.",
 body:`<main><div class="wrap prose"><h1>About</h1><p>GDScript Cookbook is a free collection of working Godot 4 scripts for the systems most games need: movement, combat, enemy AI, menus, saving, audio and more.</p><p>Every recipe is written to be pasted into a project and run. Each one comes with a playable preview so you can see what the code does before you use it, sliders to tune its values, a step-by-step setup guide and fixes for the mistakes people hit most often.</p><h2>Using the code</h2><p>All recipe code is free to use in personal and commercial games. No credit needed.</p><h2>Contact</h2><p>Questions, bugs or recipe requests: use the <a href="/feedback/">feedback page</a>.</p></div></main>`}));
out("privacy/", page({path:"/privacy/", title:"Privacy policy | GDScript Cookbook", desc:"How GDScript Cookbook handles your data.",
 body:`<main><div class="wrap prose"><h1>Privacy policy</h1><p>Last updated: November 1, 2026.</p><h2>What we collect</h2><p>When you send feedback we store the message, its type, the page it came from, your browser's user-agent and, only if you enter it, your email address. We use this only to fix problems, add requested recipes and reply to you.</p><p>The site remembers your last selected category in your own browser's local storage. It is never sent to us.</p><h2>Analytics and advertising</h2><p>We may add Google Analytics to count visits and advertising to support the site. If we do, this policy will be updated first, and those services may use cookies. Where required, you will be asked for consent.</p><h2>Your choices</h2><p>To have your feedback or email deleted, send a request through the <a href="/feedback/">feedback page</a> and include the email you used.</p><h2>Hosting</h2><p>The site is hosted on Vercel, which processes standard server logs such as IP addresses to deliver and protect the site.</p></div></main>`}));
// admin inbox
out("admin/", page({path:"/admin/", title:"Feedback inbox", desc:"Private feedback inbox.", noindex:true, script:false,
 body:`<main><div class="wrap prose" style="max-width:900px"><h1>Feedback inbox</h1>
<form id="ak" class="fb" style="margin:0"><div class="fbrow"><label for="key">Admin key</label><input id="key" type="password" autocomplete="current-password"></div><div class="fbactions"><button class="btn" type="submit">Load messages</button><span class="fbstatus" id="ast" role="status"></span></div></form>
<div id="inbox" style="display:grid;gap:12px;margin-top:18px"></div></div></main>
<script>
const E=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;");
let KEY=""; try{KEY=sessionStorage.getItem("ak")||""}catch(e){} document.getElementById("key").value=KEY;
async function load(){ const st=document.getElementById("ast"); st.textContent="Loading…";
  const r=await fetch("/api/feedback",{headers:{"x-admin-key":KEY}}); const j=await r.json().catch(()=>({}));
  if(!r.ok){ st.textContent=j.error||"Error"; st.className="fbstatus err"; return; }
  st.textContent=j.items.length+" messages"; st.className="fbstatus ok";
  document.getElementById("inbox").innerHTML=j.items.map(x=>\`<article class="recipe" style="padding:12px 16px"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between"><div><span class="tag \${x.type==="bug"?"new":"node"}">\${E(x.type)}</span> <b>\${E(x.recipe)}</b> <span class="tag">\${E(new Date(x.at).toLocaleString())}</span></div><button class="btn alt" data-del="\${E(x.url)}">Delete</button></div><p style="white-space:pre-wrap;margin:10px 0 6px">\${E(x.message)}</p><small style="color:var(--muted)">\${x.email?"Reply to: "+E(x.email)+" · ":""}\${E(x.page)}</small></article>\`).join("")||"<p>No messages yet.</p>"; }
document.getElementById("ak").addEventListener("submit",e=>{e.preventDefault(); KEY=document.getElementById("key").value.trim(); try{sessionStorage.setItem("ak",KEY)}catch(e){} load();});
document.getElementById("inbox").addEventListener("click",async e=>{ const b=e.target.closest("[data-del]"); if(!b) return; if(b.dataset.c!=="1"){ b.dataset.c="1"; b.textContent="Click again to delete"; return; }
  await fetch("/api/feedback?url="+encodeURIComponent(b.dataset.del),{method:"DELETE",headers:{"x-admin-key":KEY}}); load(); });
if(KEY) load();
</script>`}));
// sitemap + robots
const urls = ["/","/feedback/","/about/","/privacy/",...R.map(r=>`/recipes/${slugOf(r.title)}/`)];
fs.writeFileSync("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${SITE}${u}</loc><lastmod>2026-11-01</lastmod></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync("public/robots.txt", `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log("pages:", urls.length+1);
