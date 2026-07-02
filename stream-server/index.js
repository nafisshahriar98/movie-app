import express from "express";
import cors from "cors";
import WebTorrent from "webtorrent";

const app = express();
const client = new WebTorrent();

// Prevent unhandled torrent errors from crashing the server
client.on("error", (err) => {
    console.error("WebTorrent error:", err.message);
});

app.use(cors({ origin: "http://localhost:5173" }));

app.get("/", (req, res) => {
    res.send("Stream server is running");
});

// Helper: pipe the biggest file in a ready torrent to the response
function pipeBiggestFile(torrent, res) {
    const file = torrent.files.reduce((a, b) => a.size > b.size ? a : b);
    console.log("[stream] piping:", file.name, `(${(file.length / 1e6).toFixed(1)}MB)`);
    res.setHeader("Content-Type", "video/mp4");
    file.createReadStream().pipe(res);
}

app.get("/stream", (req, res) => {
    const magnet = req.query.magnet;
    if (!magnet) {
        return res.status(400).send("No magnet link provided");
    }

    console.log("[stream] request received");

    // If this torrent is already loaded, reuse it — but wait for 'ready' if metadata isn't in yet
    const existing = client.torrents.find(t => magnet.includes(t.infoHash.toLowerCase()));
    if (existing) {
        console.log("[stream] reusing existing torrent:", existing.infoHash, "ready:", existing.ready);
        if (existing.ready) {
            pipeBiggestFile(existing, res);
        } else {
            existing.once("ready", () => pipeBiggestFile(existing, res));
        }
        return;
    }

    console.log("[stream] adding new torrent...");
    const torrent = client.add(magnet);

    torrent.on("infoHash", () => console.log("[stream] infoHash:", torrent.infoHash));
    torrent.on("metadata", () => console.log("[stream] metadata received"));
    torrent.on("ready", () => {
        console.log(`[stream] READY — ${torrent.files.length} files, ${torrent.numPeers} peers`);
        pipeBiggestFile(torrent, res);
    });
    torrent.on("error", (err) => {
        console.error("[stream] torrent error:", err.message);
        if (!res.headersSent) res.status(500).send("Torrent error");
    });

    // Log peer discovery progress every 5s
    const peerLog = setInterval(() => {
        console.log(`[stream] peers: ${torrent.numPeers}, progress: ${(torrent.progress * 100).toFixed(1)}%`);
    }, 5000);
    req.on("close", () => clearInterval(peerLog));
});

app.listen(3001, () => {
    console.log("Stream server running on port 3001");
});