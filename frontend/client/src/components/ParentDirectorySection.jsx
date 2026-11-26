import { useEffect, useState } from "react";
import { showParents } from "../services/parentService.js";
import { showStudents } from "../services/studentService.js";

const COLUMN_COUNT = 6;

export default function ParentDirectorySection() {
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        Promise.all([showParents(), showStudents()])
            .then(([parentsResult, studentsResult]) => {
                if (!active) return;
                setParents(Array.isArray(parentsResult.data) ? parentsResult.data : []);
                setStudents(Array.isArray(studentsResult.data) ? studentsResult.data : []);
                setLoading(false);
            })
            .catch((err) => {
                if (!active) return;
                setError(err.response?.data?.message || "Gagal memuat data orang tua.");
                setLoading(false);
            });
        return () => { active = false; };
    }, []);

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                        Data keluarga
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                        Orang Tua
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Data orang tua yang terhubung dengan siswa.
                    </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                    <p className="text-xs text-slate-500">Total orang tua</p>
                    <p className="mt-0.5 text-lg font-semibold text-slate-900">{parents.length}</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                    <h3 className="font-semibold text-slate-900">Data orang tua</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{parents.length} data tersimpan</p>
                </div>

                {loading ? (
                    <div className="px-5 py-10 text-center text-sm text-slate-500">
                        Memuat data orang tua dan siswa...
                    </div>
                ) : error ? (
                    <div role="alert" className="px-5 py-10 text-center text-sm text-red-600">
                        {error}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] border-collapse text-left text-[13px] leading-tight">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                    <th scope="col" className="w-16 px-4 py-2.5">No</th>
                                    <th scope="col" className="px-4 py-2.5">Nama orang tua</th>
                                    <th scope="col" className="px-4 py-2.5">Umur</th>
                                    <th scope="col" className="px-4 py-2.5">Telepon</th>
                                    <th scope="col" className="px-4 py-2.5">Siswa</th>
                                    <th scope="col" className="px-4 py-2.5">Alamat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {parents.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLUMN_COUNT} className="px-4 py-10 text-center text-sm text-slate-500">
                                            Belum ada data orang tua.
                                        </td>
                                    </tr>
                                ) : (
                                    parents.map((parent, index) => {
                                        const studentName = students.find(
                                            (student) => student.id === parent.studentId
                                        )?.name;
                                        return (
                                            <tr key={parent.id} className="hover:bg-slate-50/70">
                                                <td className="px-4 py-2 text-slate-400">{index + 1}</td>
                                                <td className="px-4 py-2 font-medium text-slate-800">{parent.name}</td>
                                                <td className="px-4 py-2 text-slate-600">{parent.age}</td>
                                                <td className="px-4 py-2 text-slate-600">{parent.phone || "-"}</td>
                                                <td className="px-4 py-2 text-slate-600">{studentName || "-"}</td>
                                                <td className="max-w-56 truncate px-4 py-2 text-slate-600" title={parent.address || ""}>
                                                    {parent.address || "-"}
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
    );
}
