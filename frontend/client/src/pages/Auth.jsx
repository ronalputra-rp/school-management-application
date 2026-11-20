import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { userLogin, userRegister } from "../services/authService.js";

const emptyForm = { name: "", email: "", password: "" };

export default function AuthPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState(emptyForm);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (localStorage.getItem("token")) {
        return <Navigate to="/directory" replace />;
    }

    const handleChange = (event) => {
        setForm((previous) => ({
            ...previous,
            [event.target.name]: event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            if (mode === "register") {
                const result = await userRegister({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                });
                setMessage(result.message || "Registrasi berhasil, silakan login.");
                setMode("login");
                setForm((previous) => ({ ...emptyForm, email: previous.email }));
            } else {
                const result = await userLogin({
                    email: form.email,
                    password: form.password,
                });
                setMessage(result.message || "Login berhasil.");
                navigate("/directory", { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Permintaan gagal.");
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode((previous) => (previous === "login" ? "register" : "login"));
        setError("");
        setMessage("");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
                <h1 className="text-xl font-semibold">
                    {mode === "login" ? "Masuk" : "Daftar"}
                </h1>

                {mode === "register" && (
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Nama"
                        className="w-full rounded border border-slate-300 px-3 py-2"
                    />
                )}
                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full rounded border border-slate-300 px-3 py-2"
                />
                <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full rounded border border-slate-300 px-3 py-2"
                />

                {message && <p className="text-sm text-green-600">{message}</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-slate-800 px-3 py-2 text-white disabled:opacity-50"
                >
                    {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
                </button>

                <button
                    type="button"
                    onClick={switchMode}
                    className="w-full text-sm text-slate-500 hover:underline"
                >
                    {mode === "login"
                        ? "Belum punya akun? Daftar"
                        : "Sudah punya akun? Masuk"}
                </button>
            </form>
        </div>
    );
}
