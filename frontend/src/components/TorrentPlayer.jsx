import { useEffect, useState } from "react";

// Browsers can ONLY connect to WebSocket (wss://) trackers — not UDP.
// These are the known public WSS trackers that WebTorrent (used by Webtor) can reach.
const WSS_TRACKERS = [
    "wss://tracker.btorrent.xyz",
    "wss://tracker.openwebtorrent.com",
    "wss://tracker.webtorrent.dev",
    "wss://tracker.files.fm:7073/announce",
];

// Pre-build the tracker query string once so we don't repeat it for every magnet link.
// encodeURIComponent makes the URL safe to embed inside the magnet string.
const trackerParams = WSS_TRACKERS
    .map(t => `&tr=${encodeURIComponent(t)}`)
    .join("");

// Scores a single torrent result from apibay.
// Higher score = better candidate for browser streaming.
// Returns -1 if the torrent is completely unusable (we filter these out).
function scoreTorrent(t) {
    const name = (t.name || "").toLowerCase();
    const sizeGB = Number(t.size) / (1024 ** 3); // apibay gives size in bytes
    const seeders = Number(t.seeders) || 0;

    // No hash or no one seeding = nothing to stream
    if (!t.info_hash || seeders <= 0) return -1;

    // Start with seeders as the base — more peers = faster stream
    let score = seeders;

    // Resolution — 1080p is the browser sweet spot; 4K is often unplayable in browser
    if (name.includes("1080p")) score += 500;
    else if (name.includes("720p")) score += 300;
    else if (name.includes("2160p") || name.includes("4k")) score -= 200;

    // Codec — x264/H264 plays in every browser; x265/HEVC often doesn't (no software decoder in Chrome)
    if (name.includes("x264") || name.includes("h264") || name.includes("avc")) score += 200;
    if (name.includes("x265") || name.includes("hevc")) score -= 300;

    // Source quality — BluRay and WEB-DL are clean; CAM rips are terrible
    if (name.includes("bluray") || name.includes("blu-ray")) score += 100;
    if (name.includes("web-dl") || name.includes("webrip")) score += 50;
    if (name.includes("cam") || name.includes("hdcam") || name.includes("ts")) score -= 500;

    // File size — too big buffers forever in browser; suspiciously small = bad rip
    if (sizeGB > 8) score -= 200;
    if (sizeGB < 0.3) score -= 300;

    return score;
}

function TorrentPlayer({ imdbId, poster }) {
    const [magnet, setMagnet] = useState(null);       // magnet link for the currently active torrent
    const [error, setError] = useState(null);          // error message to show the user
    const [candidates, setCandidates] = useState([]);  // top 5 scored torrents for this movie
    const [activeIndex, setActiveIndex] = useState(0); // which candidate is currently playing
    const [useFallback, setUseFallback] = useState(false); // true = Webtor, false = our Node server

    // Effect 1: fetch torrent options — try YTS first, fall back to apibay.
    // imdbId is in the dependency array — this re-runs whenever a different movie is opened.
    useEffect(() => {
        const buildMagnet = (t) =>
            `magnet:?xt=urn:btih:${t.info_hash}&dn=${encodeURIComponent(t.name)}${trackerParams}`;

        const fetchTorrents = async () => {
            // --- Step 1: try YTS ---
            // YTS only indexes popular movies but every result is pre-filtered:
            // small file size, H264, multiple qualities. Much faster to stream than raw apibay results.
            try {
                const res = await fetch(`/api/yts/api/v2/list_movies.json?query_term=${imdbId}&limit=1`);
                const json = await res.json();
                const movie = json?.data?.movies?.[0];

                if (movie?.torrents?.length > 0) {
                    const ytsScore = (t) =>
                        (t.quality === "1080p" ? 500 : t.quality === "720p" ? 300 : 0) +
                        (t.type === "bluray" ? 100 : 50) +
                        (t.seeds || 0);

                    const ytsCandidates = movie.torrents
                        .filter(t => t.quality !== "2160p" && (t.seeds || 0) > 0)
                        .sort((a, b) => ytsScore(b) - ytsScore(a))
                        .slice(0, 5)
                        // Normalize to the same shape the JSX expects: info_hash, name, seeders
                        .map(t => ({
                            info_hash: t.hash,
                            name: `${movie.title} ${t.quality} ${t.type}`,
                            seeders: t.seeds,
                            _score: ytsScore(t),
                        }));

                    if (ytsCandidates.length > 0) {
                        setCandidates(ytsCandidates);
                        setMagnet(buildMagnet(ytsCandidates[0]));
                        return; // YTS worked — skip apibay entirely
                    }
                }
            } catch (_) {
                // YTS unreachable or returned bad data — fall through to apibay
            }

            // --- Step 2: fall back to apibay ---
            // Covers movies not on YTS: older films, foreign, documentaries, niche releases.
            // cat=207 is apibay's category for HD movies.
            try {
                const res = await fetch(`/api/piratebay/q.php?q=${imdbId}&cat=207`);
                const data = await res.json();

                // apibay returns [{id:"0"}] when nothing is found
                if (!data || data.length === 0 || data[0].id === "0") {
                    setError("No torrent found for this movie.");
                    return;
                }

                // Score every result, drop unusable ones, take the top 5
                const scored = data
                    .map(t => ({ ...t, _score: scoreTorrent(t) }))
                    .filter(t => t._score > 0)
                    .sort((a, b) => b._score - a._score)
                    .slice(0, 5);

                if (scored.length === 0) {
                    setError("No streamable torrent found.");
                    return;
                }

                setCandidates(scored);
                setMagnet(buildMagnet(scored[0]));
            } catch (_) {
                setError("Failed to find torrent.");
            }
        };

        setUseFallback(false); // reset fallback whenever movie changes
        fetchTorrents();
    }, [imdbId]);

    // Effect 2: hand the magnet to Webtor ONLY when useFallback is true.
    // Webtor is loaded via a <script> tag in index.html — it reads from window.webtor[].
    useEffect(() => {
        if (!magnet || !useFallback) return;

        // Clear the container first — without this, switching sources stacks players on top of each other
        const container = document.getElementById("torrent-player");
        if (container) container.innerHTML = "";

        // Push config into Webtor's queue. Webtor picks this up and renders the player into #torrent-player.
        window.webtor = window.webtor || [];
        window.webtor.push({
            id: "torrent-player",
            magnet,
            poster,
            width: "100%",
            lang: "en",
        });
    }, [magnet, poster, useFallback]); // also re-runs when fallback is triggered

    return (
        <div className="torrent-player-wrapper">
            <p className="torrent-player-label">🎬 Streaming</p>

            {/* Show error if apibay returned nothing or fetch failed */}
            {error && <p className="torrent-error">{error}</p>}

            {/* Show loading state while waiting for apibay response */}
            {!magnet && !error && <p className="torrent-loading">⏳ Finding torrent...</p>}

            {/* Primary: stream via our own Node server — fast, no third-party dependency */}
            {magnet && !useFallback && (
                <video
                    src={`http://localhost:3001/stream?magnet=${encodeURIComponent(magnet)}`}
                    controls
                    width="100%"
                    poster={poster}
                    onError={() => setUseFallback(true)} // Node server failed → switch to Webtor
                />
            )}

            {/* Fallback: Webtor — activates if Node server errors or is unreachable */}
            {magnet && useFallback && (
                <div id="torrent-player"></div>
            )}

            {/* Alternative sources — only shown when we have more than 1 candidate */}
            {candidates.length > 1 && (
                <div className="torrent-alternatives">
                    <p>Not playing? Try another source:</p>
                    {candidates.map((c, i) => (
                        <button
                            key={c.info_hash}
                            disabled={i === activeIndex} // disable the one currently playing
                            onClick={() => {
                                setActiveIndex(i);
                                setUseFallback(false); // try Node server first for the new source too
                                setMagnet(
                                    `magnet:?xt=urn:btih:${c.info_hash}&dn=${encodeURIComponent(c.name)}${trackerParams}`
                                );
                            }}
                        >
                            {c.name.slice(0, 60)} · {c.seeders} seeders
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TorrentPlayer;
