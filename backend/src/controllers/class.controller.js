import { prisma } from '../db/src/prisma/client.js';

export const getClasses = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { className } = req.query;
        let classFilters = { userId: currentUserId };

        if (className !== undefined) {
            if (typeof className !== "string") {
                return res.status(400).send({
                    message: "Data nama kelas harus merupakan string"
                })
            }
            if (className.trim() === "") {
                return res.status(400).send({
                    message: "Data tidak boleh diisi dengan input kosong"
                })
            }
            classFilters = { ...classFilters, className: className.trim().toUpperCase() };
        }

        const classes = await prisma.class.findMany({
            where: classFilters
        })

        return res.status(200).send({
            message: "Data berhasil diambil",
            data: classes
        })

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const getClassById = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const classId = Number(req.params.id);
        if (!Number.isInteger(classId) || classId <= 0) {
            return res.status(400).send({
                message: "Parameter ID bukan merupakan angka valid"
            })
        }
        const classData = await prisma.class.findFirst({
            where: { userId: currentUserId, id: classId }
        })
        if (!classData) {
            return res.status(404).send({
                message: "Data tidak ditemukan"
            })
        }
        return res.status(200).send({
            message: "Data berhasil diambil",
            data: classData
        })

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const createClass = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        if (!req.body) {
            return res.status(401).send({
                message: "Tidak ada request yang dikirim"
            })
        }
        const { className } = req.body;

        if (!className || typeof className !== "string" || className.trim() === "") {
            return res.status(400).send({
                message: "Data nama kelas tidak valid atau wajib diisi"
            })
        }

        const normalizedClassName = className.trim().toUpperCase();
        const existingClass = await prisma.class.findUnique({
            where: {
                userId_className: {
                    userId: currentUserId,
                    className: normalizedClassName
                }
            }
        })
        if (existingClass) {
            return res.status(409).send({
                message: "Nama kelas sudah digunakan"
            })
        }

        const createdClass = await prisma.class.create({
            data: { className: normalizedClassName, userId: currentUserId }
        })
        return res.status(201).send({
            message: "Data berhasil ditambahkan",
            data: createdClass
        })
    } catch (err) {
        if (err.code === "P2002" && String(err.meta?.target).includes("className")) {
            return res.status(409).send({
                message: "Nama kelas sudah digunakan"
            })
        }
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const updateClass = async (req, res) => {
    try {
        let classUpdates = {};
        const currentUserId = req.user.id;
        const classId = Number(req.params.id);
        if (!Number.isInteger(classId) || classId <= 0) {
            return res.status(400).send({
                message: "Parameter ID bukan merupakan angka valid"
            })
        }
        const existingClass = await prisma.class.findFirst({
            where: { userId: currentUserId, id: classId }
        })
        if (!existingClass) {
            return res.status(404).send({
                message: "Data tidak ditemukan"
            })
        }
        if (!req.body) {
            return res.status(400).send({
                message: "Tidak ada request yang dikirim"
            })
        }
        const { className } = req.body;

        if (typeof className === "string") {
            if (className.trim() === "") {
                return res.status(400).send({
                    message: "Nama kelas tidak boleh kosong"
                })
            }
            const normalizedClassName = className.trim().toUpperCase();
            const existingClassWithName = await prisma.class.findUnique({
                where: {
                    userId_className: {
                        userId: currentUserId,
                        className: normalizedClassName
                    }
                }
            })
            if (existingClassWithName && existingClassWithName.id !== classId) {
                return res.status(409).send({
                    message: "Nama kelas sudah digunakan"
                })
            }
            classUpdates = { ...classUpdates, className: normalizedClassName };
        }

        const updatedClass = await prisma.class.update({
            where: { id: classId },
            data: classUpdates
        })
        return res.status(200).send({
            message: "Data berhasil diperbarui",
            data: updatedClass
        })
    } catch (err) {
        if (err.code === "P2002" && String(err.meta?.target).includes("className")) {
            return res.status(409).send({
                message: "Nama kelas sudah digunakan"
            })
        }
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const deleteClass = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const classId = Number(req.params.id);
        if (!Number.isInteger(classId) || classId <= 0) {
            return res.status(400).send({
                message: "Parameter ID bukan merupakan angka valid"
            })
        }
        const existingClass = await prisma.class.findFirst({
            where: { userId: currentUserId, id: classId },
            include: {
                _count: {
                    select: { student: true, teacher: true }
                }
            }
        })
        if (!existingClass) {
            return res.status(404).send({
                message: "Data tidak ditemukan"
            })
        }
        const affectedStudents = existingClass._count.student;
        const affectedTeachers = existingClass._count.teacher;
        await prisma.class.deleteMany({
            where: { id: classId, userId: currentUserId }
        })
        return res.status(200).send({
            message: `Data ${existingClass.id} berhasil dihapus. ${affectedStudents} siswa dan ${affectedTeachers} guru sekarang tanpa kelas.`,
            data: {
                id: existingClass.id,
                affectedStudents,
                affectedTeachers,
            }
        })
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}
