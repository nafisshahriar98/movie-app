import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, register as registerApi, getCurrentUser } from "../services/authApi";
const AuthContext = createContext();

export const useAuth = () => { return useContext(AuthContext) };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const me = await getCurrentUser(token);
                setUser(me);
            } catch (err) {
                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }
        restoreSession();

    }, []);

    const login = async ({ email, password }) => {
        const data = await loginApi({ email, password });
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser({ username: data.username, email: data.email, role: data.role });
    };

    const register = async ({ username, email, password }) => {
        const data = await registerApi({ username, email, password });
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser({ username: data.username, email: data.email, role: data.role });
    }
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

