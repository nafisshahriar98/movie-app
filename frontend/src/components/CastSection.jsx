import { useState, useEffect } from "react";
import { getMovieCredits } from "../services/api";
import "../css/CastSection.css";

function CastSection({ movieId }) {
    const [cast, setCast] = useState([]);
    const [director, setDirector] = useState(null);
    useEffect(() => {
        const fetchCredit = async () => {
            try {
                const data = await getMovieCredits(movieId);
                setCast(data.cast.slice(0, 10));
                const dir = data.crew.find(p => p.job === "Director");
                setDirector(dir ?? null);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCredit();
    }, [movieId])

    if (!cast.length) return null;

    return (
        <div className="cast-section">
            {director && (
                <p className="cast-director"> Director : <span>{director.name}</span></p>
            )}
            <h3>Cast</h3>
            <div className="cast-grid">
                {cast.map(person => (
                    <a
                        key={person.id}
                        href={`https://en.wikipedia.org/wiki/${person.name.replace(/ /g, '_')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="cast-card"
                    >
                        <img
                            src={
                                person.profile_path
                                    ? `/tmdb-image/t/p/original${person.profile_path}`
                                    : "/no-poster.png"
                            }
                            alt={person.name}
                            onError={(e) => { e.currentTarget.src = "/no-poster.png"; }}
                        />
                        <p className="cast-name">{person.name}</p>
                        <p className="cast-character">{person.character}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}

export default CastSection