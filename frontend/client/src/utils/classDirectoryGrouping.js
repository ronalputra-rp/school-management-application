export function buildClassDirectoryRows(classes, students, teachers) {
    const classList = Array.isArray(classes) ? classes : [];
    const studentList = Array.isArray(students) ? students : [];
    const teacherList = Array.isArray(teachers) ? teachers : [];

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

    // Satu guru hanya boleh muncul sekali: deduplikasi by id.
    const seenTeacherIds = new Set();
    const teachersByClass = new Map();
    for (const teacher of teacherList) {
        if (seenTeacherIds.has(teacher.id)) continue;
        seenTeacherIds.add(teacher.id);

        const key = classMap.has(teacher.classId) ? teacher.classId : 0;
        if (!teachersByClass.has(key)) {
            teachersByClass.set(key, []);
        }
        teachersByClass.get(key).push(teacher);
    }

    const rows = Array.from(classMap.values())
        .sort((a, b) => a.id - b.id)
        .map((classItem) => ({
            id: classItem.id,
            className: classItem.className,
            students: [...(studentsByClass.get(classItem.id) ?? [])]
                .sort((a, b) => a.id - b.id),
            teachers: [...(teachersByClass.get(classItem.id) ?? [])]
                .sort((a, b) => a.id - b.id),
        }));

    // Siswa dan guru dengan classId tidak ditemukan digabung dalam SATU grup "Tanpa kelas".
    const orphanStudents = studentsByClass.get(0) ?? [];
    const orphanTeachers = teachersByClass.get(0) ?? [];
    if (orphanStudents.length || orphanTeachers.length) {
        rows.push({
            id: 0,
            className: "Tanpa kelas",
            students: [...orphanStudents].sort((a, b) => a.id - b.id),
            teachers: [...orphanTeachers].sort((a, b) => a.id - b.id),
        });
    }

    return rows;
}
