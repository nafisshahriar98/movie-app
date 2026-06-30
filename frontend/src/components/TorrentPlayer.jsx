import { useEffect, useState } from "react";

function TorrentPlayer({ imdbId, poster }) {
    const [magnet, setMagnet] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`/api/piratebay/q.php?q=${imdbId}&cat=207`)
            .then(res => res.json())
            .then(data => {
                // apibay returns [{id:"0"}] when nothing is found
                if (!data || data.length === 0 || data[0].id === "0") {
                    setError("No torrent found for this movie.");
                    return;
                }

                // pick the one with most seeders (best stream quality)
                const best = data.sort((a, b) => b.seeders - a.seeders)[0];

                const trackers = [
                    "udp://tracker.opentrackr.org:1337/announce",
                    "udp://9.rarbg.to:2920/announce",
                    "wss://tracker.btorrent.xyz",
                    "wss://tracker.openwebtorrent.com",
                ].map(t => `&tr=${encodeURIComponent(t)}`).join("");

                const magnetLink =
                    `magnet:?xt=urn:btih:${best.info_hash}&dn=${encodeURIComponent(best.name)}${trackers}`;
                setMagnet(magnetLink);
            })
            .catch(() => setError("Failed to find torrent."));
    }, [imdbId]);

    useEffect(() => {
        if (!magnet) return;
        window.webtor = window.webtor || [];
        window.webtor.push({
            id: "torrent-player",
            magnet: magnet,
            poster: poster,
            width: "100%",
            lang: "en",
        });
    }, [magnet]);
    
    return (
        <div className="torrent-player-wrapper">
            <p className="torrent-player-label">🎬 Streaming</p>
            {error && <p className="torrent-error">{error}</p>}
            {!magnet && !error && <p className="torrent-loading">⏳ Finding torrent...</p>}
            <div id="torrent-player"></div>
        </div>
    );
}

export default TorrentPlayer;