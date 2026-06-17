const API_BASE = "https://localhost:7198/api/auth";

export const register = async ({ username, email, password }) => {
    const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to Register");
    }
    return await response.json();
}
export const login = async ({ email, password }) => {
    const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to Login");
    }
    return await response.json();
}

export const getCurrentUser = async (token) => {
    const response = await fetch(`${API_BASE}/me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to Fetch Current User");
    }
    return await response.json();
}