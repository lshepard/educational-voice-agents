import { AccessToken } from "livekit-server-sdk";
import { createServer } from "http";
import { config } from "dotenv";
import path from "path";
import { readFileSync } from "fs";

config({ path: path.join(import.meta.dirname, "../../.env") });

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_URL = process.env.LIVEKIT_URL!;

function createToken(roomName: string, participantName: string): string {
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantName,
    ttl: "1h",
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return at.toJwt();
}

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url!, `http://${req.headers.host}`);

  if (url.pathname === "/token") {
    const roomName = url.searchParams.get("room") || "reading-practice";
    const participantName =
      url.searchParams.get("name") || `student-${Date.now()}`;

    try {
      const token = await createToken(roomName, participantName);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          token,
          url: LIVEKIT_URL,
        })
      );
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to create token" }));
    }
    return;
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    try {
      const html = readFileSync(
        path.join(import.meta.dirname, "../../frontend/index.html"),
        "utf-8"
      );
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Token server running at http://localhost:${PORT}`);
  console.log(`Get tokens at http://localhost:${PORT}/token?room=reading-practice&name=student`);
});
