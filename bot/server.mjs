// Render uchun: worker.js dagi bot mantiqini oddiy Node serverida ishga tushiradi.
import http from "node:http";
import bot from "./worker.js";

const env = { BOT_TOKEN: process.env.BOT_TOKEN };
const PORT = process.env.PORT || 10000;

http
  .createServer(async (req, res) => {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? Buffer.concat(chunks) : undefined;
      // Render tashqi manzilini aniqlash (webhook o'rnatish uchun kerak)
      const host = req.headers["x-forwarded-host"] || req.headers.host;
      const proto = req.headers["x-forwarded-proto"] || "https";
      const request = new Request(`${proto}://${host}${req.url}`, {
        method: req.method,
        headers: req.headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
      });
      const javob = await bot.fetch(request, env);
      res.writeHead(javob.status, Object.fromEntries(javob.headers));
      res.end(Buffer.from(await javob.arrayBuffer()));
    } catch (e) {
      console.error(e);
      res.writeHead(200);
      res.end("ok");
    }
  })
  .listen(PORT, () => console.log("Bot serveri ishga tushdi, port:", PORT));
