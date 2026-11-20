import { NavLink, Outlet, useNavigate } from "react-router-dom";

const links = [
    { to: "/directory", label: "Siswa & Guru" },
    { to: "/students", label: "Siswa" },
    { to: "/teachers", label: "Guru" },
    { to: "/classes", label: "Kelas" },
    { to: "/users", label: "Pengguna" },
];

export default function Layout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("auth-change"));
        navigate("/auth", { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-6 py-4">
                    <span className="font-semibold">School Management</span>
                    <nav className="flex flex-1 flex-wrap gap-3">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    isActive
                                        ? "rounded px-3 py-1 text-sm bg-slate-800 text-white"
                                        : "rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
                    >
                        Keluar
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-5xl p-6">
                <Outlet />
            </main>
        </div>
    );
}
