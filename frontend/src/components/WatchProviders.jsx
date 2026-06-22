import { useState, useEffect } from "react";
import { getWatchProviders } from "../services/api";
import "../css/MovieDetail.css";



function WatchProviders({ movieId }) {
    const [providers, setProviders] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState("US");

    const countryList = providers ? Object.keys(providers) : [];
    const currentProviders = providers?.[selectedCountry];

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const data = await getWatchProviders(movieId);
                setProviders(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProviders();
    }, [movieId]);
    return (
        <>
            {/* Where to Watch */}
            {
                providers && (
                    <div className="watch-providers">
                        <div className="providers-header">
                            <h3>Where to Watch</h3>
                            <select
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="country-select"
                            >
                                {countryList.map(code => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>
                        </div>

                        {currentProviders ? (
                            <div className="providers-content">
                                {currentProviders.flatrate && (
                                    <div className="provider-section">
                                        <p className="provider-label">Stream</p>
                                        <div className="provider-logos">
                                            {currentProviders.flatrate.map(p => (
                                                <img
                                                    key={p.provider_id}
                                                    src={`/tmdb-image/t/p/w92${p.logo_path}`}
                                                    alt={p.provider_name}
                                                    title={p.provider_name}
                                                    className="provider-logo"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {currentProviders.rent && (
                                    <div className="provider-section">
                                        <p className="provider-label">Rent</p>
                                        <div className="provider-logos">
                                            {currentProviders.rent.map(p => (
                                                <img
                                                    key={p.provider_id}
                                                    src={`/tmdb-image/t/p/w92${p.logo_path}`}
                                                    alt={p.provider_name}
                                                    title={p.provider_name}
                                                    className="provider-logo"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {currentProviders.buy && (
                                    <div className="provider-section">
                                        <p className="provider-label">Buy</p>
                                        <div className="provider-logos">
                                            {currentProviders.buy.map(p => (
                                                <img
                                                    key={p.provider_id}
                                                    src={`/tmdb-image/t/p/w92${p.logo_path}`}
                                                    alt={p.provider_name}
                                                    title={p.provider_name}
                                                    className="provider-logo"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {!currentProviders.flatrate && !currentProviders.rent && !currentProviders.buy && (
                                    <p className="no-providers">Not available in {selectedCountry}</p>
                                )}
                            </div>
                        ) : (
                            <p className="no-providers">Not available in {selectedCountry}</p>
                        )}
                    </div>
                )
            }

        </>
    )
}

export default WatchProviders;