import index from "./index.html";
import { join } from "path";

const BASE_DIR = import.meta.dir;

Bun.serve({
  port: 3200,
  routes: {
    "/": index,
  },
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/manual/")) {
      const decoded = decodeURIComponent(url.pathname);
      const filePath = join(BASE_DIR, decoded);
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log("📖 OpenClaw 매뉴얼 북 → http://localhost:3200");
