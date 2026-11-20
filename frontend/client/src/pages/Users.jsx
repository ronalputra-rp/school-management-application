import { useEffect, useState } from "react";
import { getUser } from "../services/userService.js";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        getUser()
            .then((result) => {
                if (!active) return;
                setUsers(Array.isArray(result.data) ? result.data : []);
                setError("");
                setLoading(false);
            })
            .catch((err) => {
                if (!active) return;
                setError(err.response?.data?.message || "Gagal memuat data user.");
                setLoading(false);
            });
        return () => { active = false; };
    }, [reloadKey]);

    const handleReload = () => {
        setLoading(true);
        setReloadKey((key) => key + 1);
    };

    return (
        <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                        Akun
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Users
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Nama dan email pengguna yang terdaftar.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleReload}
                    disabled={loading}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                    {loading ? "Memuat..." : "Muat ulang"}
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {error ? (
                    <div role="alert" className="px-5 py-10 text-center text-sm text-red-600">
                        {error}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <th scope="col" className="px-5 py-3">Nama pengguna</th>
                                    <th scope="col" className="px-5 py-3">Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={2} className="px-5 py-10 text-center text-sm text-slate-500">
                                            Memuat data user...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="px-5 py-10 text-center text-sm text-slate-500">
                                            Belum ada data user.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.email} className="hover:bg-slate-50/70">
                                            <td className="px-5 py-3 font-medium text-slate-800">
                                                {user.name || "-"}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">{user.email}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}
