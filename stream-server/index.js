import express from "express";
import cors from "cors";
import WebTorrent from "webtorrent";

const app = express();
const client = new WebTorrent();

// Node clients should use UDP/HTTP trackers — far more reliable than the
// browser-only wss:// trackers the frontend magnets carry. Passed via the
// `announce` option so every magnet gets them regardless of its own list.
const ANNOUNCE = [
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://open.demonii.com:1337/announce",
    "udp://tracker.openbittorrent.com:6969/announce",
    "udp://exodus.desync.com:6969/announce",
    "udp://tracker.torrent.eu.org:451/announce",
    "udp://tracker.tiny-vps.com:6969/announce",
    "http://tracker.opentrackr.org:1337/announce",
];

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
// Handles HTTP Range requests — browsers require them for <video> playback/seeking.
function pipeFile(torrent, req, res) {
    const file = pickFile(torrent, req);
    const total = file.length;
    const type = contentTypeFor(file.name);
    console.log("[stream] piping:", file.name, `(${(total / 1e6).toFixed(1)}MB)`);

    const range = req.headers.range;
    if (range) {
        // Parse "bytes=start-end" (end optional)
        const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
        let start = parseInt(startStr, 10);
        let end = endStr ? parseInt(endStr, 10) : -1;

        if (Number.isNaN(start) || start >= total || (endStr && end < start)) {
            res.writeHead(416, { "Content-Range": `bytes */${total}` });
            return res.end();
        }
        // Serve at most 4MB per request so the player buffers progressively
        end = end < 0 || end > start + 4 * 1024 * 1024 - 1
            ? Math.min(start + 4 * 1024 * 1024 - 1, total - 1)
            : Math.min(end, total - 1);

        console.log(`[stream] range ${start}-${end}/${total}`);
        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${total}`,
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
            "Content-Type": type,
        });
        return file.createReadStream({ start, end }).pipe(res);
    }

    res.writeHead(200, {
        "Accept-Ranges": "bytes",
        "Content-Length": total,
        "Content-Type": type,
    });
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
    const torrent = client.add(magnet, { announce: ANNOUNCE });

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