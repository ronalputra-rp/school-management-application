export function buildTeacherClassRows(classes, teachers) {
    const classList = Array.isArray(classes) ? classes : [];
    const teacherList = Array.isArray(teachers) ? teachers : [];

    // Satu kelas hanya boleh muncul sekali: deduplikasi by id.
    const classMap = new Map();
    for (const classItem of classList) {
        if (!classMap.has(classItem.id)) {
            classMap.set(classItem.id, classItem);
        }
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
            teachers: [...(teachersByClass.get(classItem.id) ?? [])]
                .sort((a, b) => a.id - b.id),
        }));

    // Guru yang classId-nya tidak ditemukan tetap ditampilkan.
    const orphanTeachers = teachersByClass.get(0);
    if (orphanTeachers?.length) {
        rows.push({
            id: 0,
            className: "Tanpa kelas",
            teachers: [...orphanTeachers].sort((a, b) => a.id - b.id),
        });
    }

    return rows;
}
