import { useEffect, useState } from "react";
import { showClasses } from "../services/classService.js";
import { showStudents } from "../services/studentService.js";
import { showTeachers } from "../services/teacherService.js";
import { buildClassDirectoryRows } from "../utils/classDirectoryGrouping.js";

const COLUMN_COUNT = 6;

export default function ClassDirectoryTable() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        Promise.all([showClasses(), showStudents(), showTeachers()])
            .then(([classesResult, studentsResult, teachersResult]) => {
                if (!active) return;
                setRows(buildClassDirectoryRows(
                    classesResult.data,
                    studentsResult.data,
                    teachersResult.data,
                ));
                setLoading(false);
            })
            .catch((err) => {
                if (!active) return;
                setError(err.response?.data?.message || "Gagal memuat data.");
                setLoading(false);
            });
        return () => { active = false; };
    }, []);

    if (loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">
                Memuat data siswa, kelas, dan guru...
            </div>
        );
    }

    if (error) {
        return (
            <div role="alert" className="rounded-xl border border-red-200 bg-white px-5 py-12 text-center text-sm text-red-600 shadow-sm">
                {error}
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">
                Belum ada data kelas.
            </div>
        );
    }

    const totalStudents = rows.reduce((total, row) => total + row.students.length, 0);
    const totalTeachers = rows.reduce((total, row) => total + row.teachers.length, 0);

    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                        Data akademik
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Siswa, Kelas & Guru
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Rekap seluruh siswa dan guru dikelompokkan per kelas.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                        <p className="text-xs text-slate-500">Kelas</p>
                        <p className="mt-0.5 text-lg font-semibold text-slate-900">{rows.length}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                        <p className="text-xs text-slate-500">Siswa</p>
                        <p className="mt-0.5 text-lg font-semibold text-slate-900">{totalStudents}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                        <p className="text-xs text-slate-500">Guru</p>
                        <p className="mt-0.5 text-lg font-semibold text-slate-900">{totalTeachers}</p>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] border-collapse text-left text-[13px] leading-tight">
                        <thead>
                            <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-4 py-2.5 font-semibold">No</th>
                                <th className="px-4 py-2.5 font-semibold">Nama</th>
                                <th className="px-4 py-2.5 font-semibold">Student Number / Email</th>
                                <th className="px-4 py-2.5 font-semibold">NISN / Phone</th>
                                <th className="px-4 py-2.5 font-semibold">Gender / Salary</th>
                                <th className="px-4 py-2.5 font-semibold">Alamat</th>
                            </tr>
                        </thead>

                        {rows.map((row) => {
                            const isOrphan = row.id === 0;
                            return (
                            <tbody key={row.id} className="divide-y divide-slate-100">
                                <tr className={isOrphan
                                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white"
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                                }>
                                    <th
                                        colSpan={COLUMN_COUNT}
                                        className="px-4 py-2.5 text-left font-semibold"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                                                    {isOrphan ? "Tanpa kelas" : "Kelas"}
                                                </span>
                                                <span>{isOrphan ? "Siswa & guru tanpa kelas" : row.className}</span>
                                            </div>
                                            <span className={`text-xs font-normal ${isOrphan ? "text-red-100" : "text-blue-100"}`}>
                                                {row.students.length} siswa · {row.teachers.length} guru
                                            </span>
                                        </div>
                                    </th>
                                </tr>

                                <tr className={isOrphan ? "bg-red-50" : "bg-sky-50"}>
                                    <th
                                        colSpan={COLUMN_COUNT}
                                        className={`px-4 py-1 text-left text-[11px] font-semibold uppercase tracking-wider ${isOrphan ? "text-red-700" : "text-sky-700"}`}
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <span className={`h-1.5 w-1.5 rounded-full ${isOrphan ? "bg-red-500" : "bg-sky-500"}`} />
                                            Siswa
                                        </span>
                                    </th>
                                </tr>
                                {row.students.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLUMN_COUNT} className="px-4 py-2 text-xs italic text-slate-400">
                                            Belum ada siswa
                                        </td>
                                    </tr>
                                ) : (
                                    row.students.map((student, index) => {
                                        const noClass = isOrphan || student.classId == null;
                                        return (
                                        <tr
                                            key={`student-${student.id}`}
                                            className={noClass ? "bg-red-50/60 hover:bg-red-100/70" : "hover:bg-slate-50/70"}
                                        >
                                            <td className="px-4 py-1.5 text-slate-400">{index + 1}</td>
                                            <td className="px-4 py-1.5 font-medium text-slate-800">
                                                <span className="inline-flex items-center gap-2">
                                                    <span className={noClass ? "text-red-700" : ""}>{student.name}</span>
                                                    {noClass && (
                                                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                                                            Tanpa kelas
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-1.5 text-slate-600">{student.studentNumber}</td>
                                            <td className="px-4 py-1.5 text-slate-600">{student.nisn}</td>
                                            <td className="px-4 py-1.5 text-slate-600">{student.gender}</td>
                                            <td className="max-w-56 truncate px-4 py-1.5 text-slate-600" title={student.address || ""}>
                                                {student.address || "-"}
                                            </td>
                                        </tr>
                                        );
                                    })
                                )}

                                <tr className={isOrphan ? "bg-red-50" : "bg-emerald-50"}>
                                    <th
                                        colSpan={COLUMN_COUNT}
                                        className={`px-4 py-1 text-left text-[11px] font-semibold uppercase tracking-wider ${isOrphan ? "text-red-700" : "text-emerald-700"}`}
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <span className={`h-1.5 w-1.5 rounded-full ${isOrphan ? "bg-red-500" : "bg-emerald-500"}`} />
                                            Guru
                                        </span>
                                    </th>
                                </tr>
                                {row.teachers.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLUMN_COUNT} className="px-4 py-2 text-xs italic text-slate-400">
                                            Belum ada guru
                                        </td>
                                    </tr>
                                ) : (
                                    row.teachers.map((teacher, index) => {
                                        const noClass = isOrphan || teacher.classId == null;
                                        return (
                                        <tr
                                            key={`teacher-${teacher.id}`}
                                            className={noClass ? "bg-red-50/60 hover:bg-red-100/70" : "hover:bg-slate-50/70"}
                                        >
                                            <td className="px-4 py-1.5 text-slate-400">{index + 1}</td>
                                            <td className="px-4 py-1.5 font-medium text-slate-800">
                                                <span className="inline-flex items-center gap-2">
                                                    <span className={noClass ? "text-red-700" : ""}>{teacher.name}</span>
                                                    {noClass && (
                                                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                                                            Tanpa kelas
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-1.5 text-slate-600">{teacher.email || "-"}</td>
                                            <td className="px-4 py-1.5 text-slate-600">{teacher.phone || "-"}</td>
                                            <td className="px-4 py-1.5 text-slate-600">{teacher.salary}</td>
                                            <td className="max-w-56 truncate px-4 py-1.5 text-slate-600" title={teacher.address || ""}>
                                                {teacher.address || "-"}
                                            </td>
                                        </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            );
                        })}
                    </table>
                </div>
            </div>
        </section>
    );
}
