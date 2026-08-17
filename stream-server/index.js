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

// Pick the file the client asked for (fileIdx from torrentio), with a safety check.
// Falls back to the biggest file when no index was given (YTS/apibay candidates).
function pickFile(torrent, req) {
    const fileIdx = Number(req.query.fileIdx);

    if (!Number.isNaN(fileIdx) && torrent.files[fileIdx]) {
        const f = torrent.files[fileIdx];
        // Sanity check: the index must point at a video file, not a .srt/.nfo
        if (/\.(mp4|mkv|webm|avi)$/i.test(f.name)) return f;
        console.log("[stream] fileIdx", fileIdx, "is not a video:", f.name);
    }

    // Fallback: biggest file in the torrent
    return torrent.files.reduce((a, b) => (a.size > b.size ? a : b));
}
// Browsers decide playability from this header. Match the real file, not a guess.
function contentTypeFor(name) {
    if (/\.mkv$/i.test(name)) return "video/x-matroska";
    if (/\.webm$/i.test(name)) return "video/webm";
    if (/\.mp4$/i.test(name)) return "video/mp4";
    return "application/octet-stream";
}

// Do the actual streaming: pick a file, set the honest content type, pipe it out.
function pipeFile(torrent, req, res) {
    const file = pickFile(torrent, req);
    console.log("[stream] piping:", file.name, `(${(file.length / 1e6).toFixed(1)}MB)`);
    res.setHeader("Content-Type", contentTypeFor(file.name));
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
            pipeFile(existing, req, res);
        } else {
            existing.once("ready", () => pipeFile(existing, req, res));
        }
        return;
    }

    console.log("[stream] adding new torrent...");
    const torrent = client.add(magnet);

    torrent.on("infoHash", () => console.log("[stream] infoHash:", torrent.infoHash));
    torrent.on("metadata", () => console.log("[stream] metadata received"));
    torrent.on("ready", () => {
        console.log(`[stream] READY — ${torrent.files.length} files, ${torrent.numPeers} peers`);
        pipeFile(torrent, req, res);
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