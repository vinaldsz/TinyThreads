import express from "express";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

await app.prepare();
const server = express();

// Example API route
server.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express + Next" });
});

// Let Next handle everything else
server.all("*", (req, res) => {
  return handle(req, res);
});

const port = process.env.PORT || 3000;
server.listen(port, (err) => {
  if (err) throw err;
  console.log(
    `> Ready on http://localhost:${port} — env=${
      process.env.NODE_ENV || "development"
    }`
  );
});
