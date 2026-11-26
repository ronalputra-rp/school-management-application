import { useCallback, useEffect, useState } from "react";
import { addingParents, showParents, updatingParents } from "../services/parentService.js";
import { showStudents } from "../services/studentService.js";
import FormModal from "./FormModal.jsx";
import Toast from "./Toast.jsx";

const COLUMN_COUNT = 6;

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

function parentFields(students) {
    return [
        { name: "name", label: "Nama orang tua", type: "text", required: true, placeholder: "Nama lengkap" },
        { name: "age", label: "Umur", type: "number", required: true, min: 0, placeholder: "Contoh: 42" },
        {
            name: "phone",
            label: "Nomor telepon",
            type: "text",
            placeholder: "Contoh: 081234567890",
            maxLength: 13,
            hint: "Opsional, 11-13 digit angka",
        },
        {
            name: "studentId",
            label: "Siswa",
            type: "select",
            placeholder: "Tanpa siswa",
            options: students.map((student) => ({
                value: String(student.id),
                label: `${student.name} - ${student.studentNumber}`,
            })),
        },
        { name: "address", label: "Alamat", type: "textarea", placeholder: "Opsional" },
    ];
}

const emptyForm = {
    name: "",
    age: "",
    phone: "",
    studentId: "",
    address: "",
};

export default function ParentTable() {
    const [rows, setRows] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const closeToast = useCallback(() => setToast(null), []);

    useEffect(() => {
        let active = true;
        Promise.all([showParents(), showStudents()])
            .then(([parentsResult, studentsResult]) => {
                if (!active) return;
                setRows(Array.isArray(parentsResult.data) ? parentsResult.data : []);
                setStudents(Array.isArray(studentsResult.data) ? studentsResult.data : []);
                setLoading(false);
            })
            .catch((err) => {
                if (!active) return;
                setError(err.response?.data?.message || "Gagal memuat data.");
                setLoading(false);
            });
        return () => { active = false; };
    }, [reloadKey]);

    const handleFormChange = (name, value) => {
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const openCreate = () => {
        setForm(emptyForm);
        setFormError("");
        setModal({ mode: "create" });
    };

    const openEdit = (parent) => {
        setForm({
            name: parent.name ?? "",
            age: String(parent.age ?? ""),
            phone: parent.phone ?? "",
            studentId: String(parent.studentId ?? ""),
            address: parent.address ?? "",
        });
        setFormError("");
        setModal({ mode: "edit", entity: parent });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");
        setSubmitting(true);

        const phone = form.phone.trim();
        if (phone && !/^\d{11,13}$/.test(phone)) {
            setFormError("Nomor telepon harus 11-13 digit angka.");
            setSubmitting(false);
            return;
        }

        const payload = {
            name: form.name.trim(),
            age: Number(form.age),
        };
        if (phone) payload.phone = phone;
        if (form.address.trim()) payload.address = form.address.trim();
        if (form.studentId !== "") payload.studentId = Number(form.studentId);

        try {
            const result = modal.mode === "create"
                ? await addingParents(payload)
                : await updatingParents(modal.entity.id, payload);
            setModal(null);
            setToast({ type: "success", message: result.message || "Data orang tua berhasil disimpan." });
            setReloadKey((key) => key + 1);
        } catch (err) {
            setFormError(err.response?.data?.message || "Gagal menyimpan data orang tua.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <section className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                            Data orang tua
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            Daftar Orang Tua
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Kelola data orang tua dan hubungannya dengan siswa.
                        </p>
                    </div>
                    <div className="flex flex-col items-stretch gap-3 sm:items-end">
                        <button
                            type="button"
                            onClick={openCreate}
                            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                            + Tambah orang tua
                        </button>
                        <div className="rounded-lg border border-slate-200 bg-white px-4 py-2.5">
                            <p className="text-xs text-slate-500">Total orang tua</p>
                            <p className="mt-0.5 text-lg font-semibold text-slate-900">{rows.length}</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">Data orang tua</h2>
                        <p className="mt-0.5 text-xs text-slate-500">{rows.length} data tersimpan</p>
                    </div>

                    {loading ? (
                        <div className="px-5 py-12 text-center text-sm text-slate-500">
                            Memuat data orang tua dan siswa...
                        </div>
                    ) : error ? (
                        <div role="alert" className="px-5 py-12 text-center text-sm text-red-600">
                            {error}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] border-collapse text-left text-[13px] leading-tight">
                                <thead>
                                    <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                        <th scope="col" className="w-16 px-5 py-2.5">No</th>
                                        <th scope="col" className="px-4 py-2.5">Nama orang tua</th>
                                        <th scope="col" className="px-4 py-2.5">Umur</th>
                                        <th scope="col" className="px-4 py-2.5">Telepon</th>
                                        <th scope="col" className="px-4 py-2.5">Siswa</th>
                                        <th scope="col" className="px-4 py-2.5">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={COLUMN_COUNT} className="px-5 py-12 text-center text-sm text-slate-500">
                                                Belum ada data orang tua.
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((parent, index) => {
                                            const studentName = students.find(
                                                (student) => student.id === parent.studentId
                                            )?.name;
                                            return (
                                                <tr key={parent.id} className="hover:bg-slate-50/70">
                                                    <td className="px-5 py-2.5 text-slate-400">{index + 1}</td>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <span
                                                                aria-hidden="true"
                                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${avatarColors[index % avatarColors.length]}`}
                                                            >
                                                                {getInitials(parent.name)}
                                                            </span>
                                                            <span className="font-medium text-slate-800">{parent.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-slate-600">{parent.age}</td>
                                                    <td className="px-4 py-2.5 text-slate-600">{parent.phone || "-"}</td>
                                                    <td className="px-4 py-2.5 text-slate-600">{studentName || "-"}</td>
                                                    <td className="px-4 py-2.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(parent)}
                                                            className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                        >
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {modal && (
                <FormModal
                    title={modal.mode === "create" ? "Tambah orang tua" : "Edit orang tua"}
                    description={modal.mode === "create"
                        ? "Isi data orang tua baru."
                        : `Ubah data ${modal.entity.name}.`}
                    fields={parentFields(students)}
                    values={form}
                    error={formError}
                    submitting={submitting}
                    onChange={handleFormChange}
                    onSubmit={handleSubmit}
                    onClose={() => setModal(null)}
                />
            )}

            <Toast toast={toast} onClose={closeToast} />
        </>
    );
}
