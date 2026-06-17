import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext";
import "../css/Auth.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setError(null);
        setLoading(true);

        try {
            await login({ email, password });
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <h2>Log in</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <label>
                    Email
                    <input type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </label>

                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Log in"}
                </button>
            </form>

            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>

        </div>




    );
}

export default Login;