import { Navigate, Outlet } from "react-router-dom";

function isTokenValid() {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
        const payload = token.split(".")[1];
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
        const decoded = JSON.parse(atob(padded));
        return decoded.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export default function AuthGuard() {
    if (!isTokenValid()) {
        return <Navigate to="/auth" replace />;
    }
    return <Outlet />;
}
