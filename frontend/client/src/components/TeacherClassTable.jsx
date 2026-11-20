import { useCallback, useEffect, useState } from "react";
import {
    creatingTeacher,
    deletingTeacher,
    showTeachers,
    updatingTeacher,
} from "../services/teacherService.js";
import { showClasses } from "../services/classService.js";
import { buildTeacherClassRows } from "../utils/teacherGrouping.js";
import ConfirmModal from "./ConfirmModal.jsx";
import FormModal from "./FormModal.jsx";
import Toast from "./Toast.jsx";

const COLUMN_COUNT = 7;

const avatarColors = [
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
];

function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
}

function teacherFields(classes) {
    return [
        { name: "name", label: "Nama guru", type: "text", required: true, placeholder: "Nama lengkap" },
        { name: "email", label: "Email", type: "email", placeholder: "Opsional" },
        {
            name: "phone",
            label: "Phone",
            type: "text",
            placeholder: "Opsional",
            hint: "11 sampai 13 digit angka",
            maxLength: 13,
        },
        { name: "salary", label: "Salary", type: "number", required: true, min: 0 },
        {
            name: "classId",
            label: "Kelas",
            type: "select",
            placeholder: "Tanpa kelas",
            options: classes.map((item) => ({
                value: String(item.id),
                label: item.className,
            })),
        },
        { name: "address", label: "Alamat", type: "textarea", placeholder: "Opsional" },
    ];
}

const emptyForm = {
    name: "",
    email: "",
    phone: "",
    salary: "",
    classId: "",
    address: "",
};

export default function TeacherClassTable() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [toast, setToast] = useState(null);
    const [collapsedIds, setCollapsedIds] = useState([]);

    const closeToast = useCallback(() => setToast(null), []);

    useEffect(() => {
        let active = true;
        Promise.all([showClasses(), showTeachers()])
            .then(([classesResult, teachersResult]) => {
                if (!active) return;
                setRows(buildTeacherClassRows(classesResult.data, teachersResult.data));
                setLoading(false);
            })
            .catch((err) => {
                if (!active) return;
                setError(err.response?.data?.message || "Gagal memuat data.");
                setLoading(false);
            });
        return () => { active = false; };
    }, [reloadKey]);

    const totalTeachers = rows.reduce((total, row) => total + row.teachers.length, 0);
    const classOptions = rows.filter((row) => row.id !== 0);
    const allCollapsed = rows.length > 0 && rows.every((row) => collapsedIds.includes(row.id));

    const toggleGroup = (id) => {
        setCollapsedIds((previous) => previous.includes(id)
            ? previous.filter((item) => item !== id)
            : [...previous, id]);
    };

    const toggleAll = () => {
        setCollapsedIds(allCollapsed ? [] : rows.map((row) => row.id));
    };

    const handleFormChange = (name, value) => {
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const openCreate = () => {
        setForm(emptyForm);
        setFormError("");
        setModal({ mode: "create" });
    };

    const openEdit = (teacher) => {
        setForm({
            name: teacher.name ?? "",
            email: teacher.email ?? "",
            phone: teacher.phone ?? "",
            salary: String(teacher.salary ?? ""),
            classId: String(teacher.classId ?? ""),
            address: teacher.address ?? "",
        });
        setFormError("");
        setModal({ mode: "edit", entity: teacher });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");
        setSubmitting(true);

        const payload = {
            name: form.name.trim(),
            salary: Number(form.salary),
        };
        payload.classId = form.classId === "" ? null : Number(form.classId);
        if (form.email.trim()) payload.email = form.email.trim();
        if (form.phone.trim()) payload.phone = form.phone.trim();
        if (form.address.trim()) payload.address = form.address.trim();

        try {
            const result = modal.mode === "create"
                ? await creatingTeacher(payload)
                : await updatingTeacher(modal.entity.id, payload);
            setModal(null);
            setToast({ type: "success", message: result.message || "Data guru berhasil disimpan." });
            setReloadKey((key) => key + 1);
        } catch (err) {
            setFormError(err.response?.data?.message || "Gagal menyimpan data guru.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const result = await deletingTeacher(confirmTarget.id);
            setToast({ type: "success", message: result.message || "Data guru berhasil dihapus." });
            setReloadKey((key) => key + 1);
        } catch (err) {
            setToast({
                type: "error",
                message: err.response?.data?.message || "Gagal menghapus data guru.",
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
                            Daftar Guru
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Data guru dikelompokkan berdasarkan kelas.
                        </p>
                    </div>
                    <div className="flex flex-col items-stretch gap-3 sm:items-end">
                        <button
                            type="button"
                            onClick={openCreate}
                            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            + Tambah guru
                        </button>
                        <div className="flex gap-3">
                            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2.5">
                                <p className="text-xs text-slate-500">Total kelas</p>
                                <p className="mt-0.5 text-lg font-semibold text-slate-900">{rows.length}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2.5">
                                <p className="text-xs text-slate-500">Total guru</p>
                                <p className="mt-0.5 text-lg font-semibold text-slate-900">{totalTeachers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-900">Guru per kelas</h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                {rows.length} grup kelas · {totalTeachers} guru
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleAll}
                            disabled={rows.length === 0}
                            className="h-8 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            {allCollapsed ? "Buka semua" : "Tutup semua"}
                        </button>
                    </div>

                    {loading ? (
                        <div className="px-5 py-12 text-center text-sm text-slate-500">
                            Memuat data guru dan kelas...
                        </div>
                    ) : error ? (
                        <div role="alert" className="px-5 py-12 text-center text-sm text-red-600">
                            {error}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[960px] border-collapse text-left text-[13px] leading-tight">
                                <thead>
                                    <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                        <th scope="col" className="w-16 px-5 py-2.5">No</th>
                                        <th scope="col" className="px-4 py-2.5">Nama guru</th>
                                        <th scope="col" className="px-4 py-2.5">Email</th>
                                        <th scope="col" className="px-4 py-2.5">Phone</th>
                                        <th scope="col" className="px-4 py-2.5">Salary</th>
                                        <th scope="col" className="px-4 py-2.5">Alamat</th>
                                        <th scope="col" className="px-4 py-2.5">Aksi</th>
                                    </tr>
                                </thead>

                                {rows.length === 0 ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan={COLUMN_COUNT} className="px-5 py-12 text-center text-sm text-slate-500">
                                                Belum ada data kelas.
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    rows.map((row) => {
                                        const noClass = row.id === 0;
                                        const isCollapsed = collapsedIds.includes(row.id);
                                        return (
                                            <tbody key={row.id} className="divide-y divide-slate-100">
                                                <tr className={noClass
                                                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white"
                                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                                                }>
                                                    <th
                                                        colSpan={COLUMN_COUNT}
                                                        className="px-2 py-2 text-left font-semibold"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleGroup(row.id)}
                                                            aria-expanded={!isCollapsed}
                                                            className="flex w-full items-center justify-between gap-3 rounded px-2 py-0.5 text-left transition hover:bg-white/10"
                                                        >
                                                            <span className="flex items-center gap-2.5">
                                                                <svg
                                                                    aria-hidden="true"
                                                                    viewBox="0 0 20 20"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.8"
                                                                    className={`h-4 w-4 shrink-0 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                                                                >
                                                                    <path d="m5 7.5 5 5 5-5" />
                                                                </svg>
                                                                <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                                                                    {noClass ? "Tanpa kelas" : "Kelas"}
                                                                </span>
                                                                <span>{noClass ? "Guru tanpa kelas" : row.className}</span>
                                                            </span>
                                                            <span className={`text-xs font-normal ${noClass ? "text-red-100" : "text-blue-100"}`}>
                                                                {row.teachers.length} guru
                                                            </span>
                                                        </button>
                                                    </th>
                                                </tr>

                                                {!isCollapsed && (row.teachers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={COLUMN_COUNT} className="px-4 py-2.5 text-xs italic text-slate-400">
                                                            Belum ada guru
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    row.teachers.map((teacher, index) => {
                                                        const unassigned = noClass || teacher.classId == null;
                                                        return (
                                                            <tr
                                                                key={teacher.id}
                                                                className={`transition-colors ${unassigned ? "bg-red-50/60 hover:bg-red-100/70" : "hover:bg-slate-50/70"}`}
                                                            >
                                                                <td className="px-5 py-1.5 text-slate-400">{index + 1}</td>
                                                                <td className="px-4 py-1.5">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <span
                                                                            aria-hidden="true"
                                                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${unassigned ? "bg-red-100 text-red-700" : avatarColors[index % avatarColors.length]}`}
                                                                        >
                                                                            {getInitials(teacher.name)}
                                                                        </span>
                                                                        <span className={`font-medium ${unassigned ? "text-red-700" : "text-slate-800"}`}>
                                                                            {teacher.name}
                                                                        </span>
                                                                        {unassigned && (
                                                                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                                                                                Tanpa kelas
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-1.5 text-slate-600">{teacher.email || "-"}</td>
                                                                <td className="px-4 py-1.5 text-slate-600">{teacher.phone || "-"}</td>
                                                                <td className="px-4 py-1.5 text-slate-600">{teacher.salary}</td>
                                                                <td className="max-w-56 truncate px-4 py-1.5 text-slate-600" title={teacher.address || ""}>
                                                                    {teacher.address || "-"}
                                                                </td>
                                                                <td className="px-4 py-1.5">
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openEdit(teacher)}
                                                                            className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setConfirmTarget(teacher)}
                                                                            className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                                                        >
                                                                            Hapus
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ))}
                                            </tbody>
                                        );
                                    })
                                )}
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {modal && (
                <FormModal
                    title={modal.mode === "create" ? "Tambah guru" : "Edit guru"}
                    description={modal.mode === "create"
                        ? "Isi data guru baru."
                        : `Ubah data ${modal.entity.name}.`}
                    fields={teacherFields(classOptions)}
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
                    message={`Yakin ingin menghapus guru "${confirmTarget.name}"? Tindakan ini tidak dapat dibatalkan.`}
                    submitting={submitting}
                    onConfirm={handleDelete}
                    onClose={() => setConfirmTarget(null)}
                />
            )}

            <Toast toast={toast} onClose={closeToast} />
        </>
    );
}
