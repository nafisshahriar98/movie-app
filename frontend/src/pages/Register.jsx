import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext";
import "../css/Auth.css";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return null;

        setError(null);
        setLoading(true);

        try {
            await register({ username, email, password });
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="auth-page">
            <h2>Create an account</h2>

            <form onSubmit={handleSubmit} className="auth-form">
                <label>
                    Username
                    <input type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                        minLength={2}
                    />
                </label>

                <label>
                    Email
                    <input type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email" />
                </label>
                <label>
                    Password
                    <input type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        minLength={6}
                    />
                </label>

                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
                </button>
            </form>

            <p>
                Already have an account? <Link to="/login">Log in</Link>
            </p>
        </div>
    );
}

export default Register;