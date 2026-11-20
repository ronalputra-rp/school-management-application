export function buildStudentClassRows(classes, students) {
    const classList = Array.isArray(classes) ? classes : [];
    const studentList = Array.isArray(students) ? students : [];

    // Satu kelas hanya boleh muncul sekali: deduplikasi by id.
    const classMap = new Map();
    for (const classItem of classList) {
        if (!classMap.has(classItem.id)) {
            classMap.set(classItem.id, classItem);
        }
    }

    // Satu siswa hanya boleh muncul sekali: deduplikasi by id.
    const seenStudentIds = new Set();
    const studentsByClass = new Map();
    for (const student of studentList) {
        if (seenStudentIds.has(student.id)) continue;
        seenStudentIds.add(student.id);

        const key = classMap.has(student.classId) ? student.classId : 0;
        if (!studentsByClass.has(key)) {
            studentsByClass.set(key, []);
        }
        studentsByClass.get(key).push(student);
    }

    const rows = Array.from(classMap.values())
        .sort((a, b) => a.id - b.id)
        .map((classItem) => ({
            id: classItem.id,
            className: classItem.className,
            students: [...(studentsByClass.get(classItem.id) ?? [])]
                .sort((a, b) => a.id - b.id),
        }));

    // Siswa yang classId-nya tidak ditemukan tetap ditampilkan.
    const orphanStudents = studentsByClass.get(0);
    if (orphanStudents?.length) {
        rows.push({
            id: 0,
            className: "Tanpa kelas",
            students: [...orphanStudents].sort((a, b) => a.id - b.id),
        });
    }

    return rows;
}
