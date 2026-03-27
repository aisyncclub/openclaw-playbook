/**
 * Static site builder — bundles all markdown into a single deployable site
 * Output: dist/ directory ready for Vercel/Netlify/GitHub Pages
 */

import { readdirSync, readFileSync, mkdirSync, copyFileSync, writeFileSync } from "fs";
import { join } from "path";

const MANUAL_DIR = join(import.meta.dir, "manual");
const DIST_DIR = join(import.meta.dir, "dist");

// 1. Collect all markdown files
const mdFiles = readdirSync(MANUAL_DIR)
  .filter(f => f.endsWith(".md"))
  .sort();

console.log(`📖 Found ${mdFiles.length} markdown files`);

// 2. Build chapters data as JSON
const chapters: { file: string; content: string }[] = [];
for (const file of mdFiles) {
  const content = readFileSync(join(MANUAL_DIR, file), "utf-8");
  chapters.push({ file, content });
  console.log(`  ✅ ${file} (${content.length} chars)`);
}

// 3. Write chapters as a JS module
const chaptersJs = `window.__CHAPTERS__ = ${JSON.stringify(chapters)};`;
writeFileSync(join(DIST_DIR, "chapters.js"), chaptersJs);
console.log(`\n📦 chapters.js written (${(chaptersJs.length / 1024).toFixed(0)}KB)`);

// 4. Copy manual files to dist/manual/ for fallback fetch
mkdirSync(join(DIST_DIR, "manual"), { recursive: true });
for (const file of mdFiles) {
  copyFileSync(join(MANUAL_DIR, file), join(DIST_DIR, "manual", file));
}

// 5. Build index.html with inline chapters
const indexHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenClaw 실전 매뉴얼 — AI싱크클럽</title>
  <meta name="description" content="AI 에이전트를 만들고, 팀으로 구성하고, 사업에 레버리지하는 완전 가이드">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./style.css">
  <script src="./chapters.js"></script>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./frontend.js"></script>
</body>
</html>`;

writeFileSync(join(DIST_DIR, "index.html"), indexHtml);
console.log("📄 index.html written");

// 6. Copy style.css
copyFileSync(join(import.meta.dir, "style.css"), join(DIST_DIR, "style.css"));
console.log("🎨 style.css copied");

console.log("\n✅ Build complete! Output: dist/");
console.log("   Run: cd dist && vercel --prod");
