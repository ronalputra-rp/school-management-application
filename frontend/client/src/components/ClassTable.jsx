import { useCallback, useEffect, useMemo, useState } from "react";
import {
    creatingClass,
    deletingClass,
    showClasses,
    updatingClass,
} from "../services/classService.js";
import ConfirmModal from "./ConfirmModal.jsx";
import FormModal from "./FormModal.jsx";
import Toast from "./Toast.jsx";

const classFields = [
    {
        name: "className",
        label: "Nama kelas",
        type: "text",
        required: true,
        placeholder: "Contoh: XII IPA 1",
        hint: "Akan disimpan dengan huruf kapital",
    },
];

const emptyForm = { className: "" };

export default function ClassTable() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [toast, setToast] = useState(null);

    const closeToast = useCallback(() => setToast(null), []);

    useEffect(() => {
        let active = true;
        showClasses()
            .then((result) => {
                if (!active) return;
                setClasses(result.data);
                setLoading(false);
            })
            .catch((err) => {
                if (!active) return;
                setError(err.response?.data?.message || "Gagal memuat data.");
                setLoading(false);
            });
        return () => { active = false; };
    }, [reloadKey]);

    const filteredClasses = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return classes;
        return classes.filter((item) =>
            String(item.className ?? "").toLowerCase().includes(query));
    }, [search, classes]);

    const handleFormChange = (name, value) => {
        const normalizedValue = name === "className" ? value.toUpperCase() : value;
        setForm((previous) => ({ ...previous, [name]: normalizedValue }));
    };

    const openCreate = () => {
        setForm(emptyForm);
        setFormError("");
        setModal({ mode: "create" });
    };

    const openEdit = (classItem) => {
        setForm({ className: classItem.className ?? "" });
        setFormError("");
        setModal({ mode: "edit", entity: classItem });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");
        setSubmitting(true);

        const payload = { className: form.className.trim().toUpperCase() };

        try {
            const result = modal.mode === "create"
                ? await creatingClass(payload)
                : await updatingClass(modal.entity.id, payload);
            setModal(null);
            setToast({ type: "success", message: result.message || "Data kelas berhasil disimpan." });
            setReloadKey((key) => key + 1);
        } catch (err) {
            setFormError(err.response?.data?.message || "Gagal menyimpan data kelas.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const result = await deletingClass(confirmTarget.id);
            setToast({ type: "success", message: result.message || "Data kelas berhasil dihapus." });
            setReloadKey((key) => key + 1);
        } catch (err) {
            setToast({
                type: "error",
                message: err.response?.data?.message || "Gagal menghapus data kelas.",
            });
        } finally {
            setConfirmTarget(null);
            setSubmitting(false);
        }
    };

    return (
        <>
            <section className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                            Data akademik
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            Daftar Kelas
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Kelola data kelas yang digunakan siswa dan guru.
                        </p>
                    </div>
                    <div className="flex flex-col items-stretch gap-3 sm:items-end">
                        <button
                            type="button"
                            onClick={openCreate}
                            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            + Tambah kelas
                        </button>
                        <div className="rounded-lg border border-slate-200 bg-white px-4 py-2.5">
                            <p className="text-xs text-slate-500">Total kelas</p>
                            <p className="mt-0.5 text-lg font-semibold text-slate-900">{classes.length}</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                            <h2 className="font-semibold text-slate-900">Semua kelas</h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                {filteredClasses.length} dari {classes.length} kelas
                            </p>
                        </div>
                        <label className="relative block">
                            <span className="sr-only">Cari kelas</span>
                            <svg
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-4-4" />
                            </svg>
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari nama kelas..."
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-64"
                            />
                        </label>
                    </div>

                    {loading ? (
                        <div className="px-5 py-12 text-center text-sm text-slate-500">
                            Memuat data kelas...
                        </div>
                    ) : error ? (
                        <div role="alert" className="px-5 py-12 text-center text-sm text-red-600">
                            {error}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                                        <th scope="col" className="w-24 px-5 py-3.5">ID</th>
                                        <th scope="col" className="px-4 py-3.5">Nama kelas</th>
                                        <th scope="col" className="px-4 py-3.5">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredClasses.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-5 py-12 text-center text-sm text-slate-500">
                                                {classes.length === 0
                                                    ? "Belum ada data kelas."
                                                    : "Tidak ada kelas yang cocok dengan pencarian."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredClasses.map((classItem) => (
                                            <tr key={classItem.id} className="transition-colors hover:bg-slate-50/80">
                                                <td className="px-5 py-3.5 text-slate-400">{classItem.id}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                        {classItem.className}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(classItem)}
                                                            className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmTarget(classItem)}
                                                            className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {modal && (
                <FormModal
                    title={modal.mode === "create" ? "Tambah kelas" : "Edit kelas"}
                    description={modal.mode === "create"
                        ? "Isi nama kelas baru."
                        : `Ubah nama kelas menjadi "${modal.entity.className}".`}
                    fields={classFields}
                    values={form}
                    error={formError}
                    submitting={submitting}
                    onChange={handleFormChange}
                    onSubmit={handleSubmit}
                    onClose={() => setModal(null)}
                />
            )}

            {confirmTarget && (
                <ConfirmModal
                    message={`Yakin ingin menghapus kelas "${confirmTarget.className}"? Siswa dan guru di kelas ini tidak akan ikut terhapus, tetapi menjadi "Tanpa kelas" dan ditandai merah.`}
                    submitting={submitting}
                    onConfirm={handleDelete}
                    onClose={() => setConfirmTarget(null)}
                />
            )}

            <Toast toast={toast} onClose={closeToast} />
        </>
    );
}
