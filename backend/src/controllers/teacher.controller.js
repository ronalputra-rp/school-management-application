import { prisma } from '../db/src/prisma/client.js';

const PHONE_PATTERN = /^\d{11,13}$/;

export const getTeachers = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const {
            name,
            phone,
            email,
            address,
            salary,
            classId,
        } = req.query;
        let teacherFilters = { userId: currentUserId };

        if (name !== undefined) {
            if (typeof name !== "string") {
                return res.status(400).send({
                    message: "Data nama harus merupakan string"
                })
            }
            if (name.trim() === "") {
                return res.status(400).send({
                    message: "Data tidak boleh diisi dengan input kosong"
                })
            }
            teacherFilters = { ...teacherFilters, name };
        }

        if (phone !== undefined) {
            if (typeof phone !== "string") {
                return res.status(400).send({
                    message: "Data nomor telepon harus merupakan string"
                })
            }
            if (!PHONE_PATTERN.test(phone)) {
                return res.status(400).send({
                    message: "Nomor telepon harus terdiri dari 11 sampai 13 digit angka"
                })
            }
            teacherFilters = { ...teacherFilters, phone };
        }

        if (email !== undefined) {
            if (typeof email !== "string") {
                return res.status(400).send({
                    message: "Data email harus merupakan string"
                })
            }
            if (email.trim() === "") {
                return res.status(400).send({
                    message: "Data tidak boleh diisi dengan input kosong"
                })
            }
            teacherFilters = { ...teacherFilters, email: email.trim().toLowerCase() };
        }

        if (address !== undefined) {
            if (typeof address !== "string") {
                return res.status(400).send({
                    message: "Data alamat harus merupakan string"
                })
            }
            if (address.trim() === "") {
                return res.status(400).send({
                    message: "Data tidak boleh diisi dengan input kosong"
                })
            }
            teacherFilters = { ...teacherFilters, address };
        }

        if (salary !== undefined) {
            const parsedSalary = Number(salary);
            if (Number.isNaN(parsedSalary)) {
                return res.status(400).send({
                    message: "Data salary harus merupakan angka"
                })
            }
            if (!Number.isInteger(parsedSalary)) {
                return res.status(400).send({
                    message: "salary harus berupa bilangan bulat"
                })
            }
            if (parsedSalary < 0) {
                return res.status(400).send({
                    message: "salary tidak boleh berupa angka negatif"
                })
            }
            teacherFilters = { ...teacherFilters, salary: parsedSalary };
        }

        if (classId !== undefined) {
            const parsedClassId = Number(classId);
            if (Number.isNaN(parsedClassId)) {
                return res.status(400).send({
                    message: "Data classId harus merupakan angka"
                })
            }
            if (!Number.isInteger(parsedClassId) || parsedClassId <= 0) {
                return res.status(400).send({
                    message: "classId harus berupa bilangan bulat positif"
                })
            }
            teacherFilters = { ...teacherFilters, classId: parsedClassId };
        }

        const teachers = await prisma.teacher.findMany({
            where: teacherFilters
        })

        return res.status(200).send({
            message: "Data berhasil diambil",
            data: teachers
        })

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const getTeacherById = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const teacherId = Number(req.params.id);
        if (!Number.isInteger(teacherId) || teacherId <= 0) {
            return res.status(400).send({
                message: "Parameter ID bukan merupakan angka valid"
            })
        }
        const teacher = await prisma.teacher.findFirst({
            where: { userId: currentUserId, id: teacherId }
        })
        if (!teacher) {
            return res.status(404).send({
                message: "Data tidak ditemukan"
            })
        }
        return res.status(200).send({
            message: "Data berhasil diambil",
            data: teacher
        })

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const createTeacher = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        let teacherData = {};
        if (!req.body) {
            return res.status(401).send({
                message: "Tidak ada request yang dikirim"
            })
        }
        const {
            name,
            salary,
            phone,
            email,
            address,
            classId,
        } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).send({
                message: "Data nama tidak valid atau nama wajib diisi"
            })
        }
        teacherData = { ...teacherData, name: name.trim() };

        if (salary === undefined || typeof salary !== "number") {
            return res.status(400).send({
                message: "Data salary harus merupakan angka"
            })
        }
        if (!Number.isInteger(salary) || salary < 0) {
            return res.status(400).send({
                message: "salary harus berupa bilangan bulat dan tidak boleh negatif"
            })
        }
        teacherData = { ...teacherData, salary };

        if (classId === undefined || classId === null || classId === "") {
            teacherData = { ...teacherData, classId: null };
        } else {
            if (typeof classId !== "number" || !Number.isInteger(classId) || classId <= 0) {
                return res.status(400).send({
                    message: "Data classId harus merupakan angka bulat positif"
                })
            }
            const existingClass = await prisma.class.findFirst({
                where: { id: classId, userId: currentUserId }
            })
            if (!existingClass) {
                return res.status(404).send({
                    message: "Data kelas tidak ditemukan"
                })
            }
            teacherData = { ...teacherData, classId };
        }

        if (phone !== undefined) {
            if (typeof phone !== "string") {
                return res.status(400).send({
                    message: "Data nomor telepon harus merupakan string"
                })
            }
            if (!PHONE_PATTERN.test(phone)) {
                return res.status(400).send({
                    message: "Nomor telepon harus terdiri dari 11 sampai 13 digit angka"
                })
            }
            teacherData = { ...teacherData, phone };
        }

        if (email !== undefined) {
            if (typeof email !== "string" || email.trim() === "") {
                return res.status(400).send({
                    message: "Data email tidak valid"
                })
            }
            const normalizedEmail = email.trim().toLowerCase();
            const existingTeacherWithEmail = await prisma.teacher.findUnique({
                where: { email: normalizedEmail }
            })
            if (existingTeacherWithEmail) {
                return res.status(409).send({
                    message: "Email sudah digunakan oleh guru lain"
                })
            }
            teacherData = { ...teacherData, email: normalizedEmail };
        }

        if (address !== undefined) {
            if (typeof address !== "string" || address.trim() === "") {
                return res.status(400).send({
                    message: "Data alamat tidak valid"
                })
            }
            teacherData = { ...teacherData, address: address.trim() };
        }

        teacherData = { ...teacherData, userId: currentUserId };

        const createdTeacher = await prisma.teacher.create({
            data: teacherData
        })
        return res.status(201).send({
            message: "Data berhasil ditambahkan",
            data: createdTeacher
        })
    } catch (err) {
        if (err.code === "P2002" && String(err.meta?.target).includes("email")) {
            return res.status(409).send({
                message: "Email sudah digunakan oleh guru lain"
            })
        }
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const updateTeacher = async (req, res) => {
    try {
        let teacherUpdates = {};
        const currentUserId = req.user.id;
        const teacherId = Number(req.params.id);
        if (!Number.isInteger(teacherId) || teacherId <= 0) {
            return res.status(400).send({
                message: "Parameter ID bukan merupakan angka valid"
            })
        }
        const existingTeacher = await prisma.teacher.findFirst({
            where: { userId: currentUserId, id: teacherId }
        })
        if (!existingTeacher) {
            return res.status(404).send({
                message: "Data tidak ditemukan"
            })
        }
        if (!req.body) {
            return res.status(400).send({
                message: "Tidak ada request yang dikirim"
            })
        }
        const {
            name,
            salary,
            phone,
            email,
            address,
            classId,
        } = req.body;

        if (typeof name === "string") {
            if (name.trim() === "") {
                return res.status(400).send({
                    message: "Nama tidak boleh kosong"
                })
            }
            teacherUpdates = { ...teacherUpdates, name: name.trim() };
        }

        if (typeof salary === "number") {
            if (!Number.isInteger(salary) || salary < 0) {
                return res.status(400).send({
                    message: "salary harus berupa bilangan bulat dan tidak boleh negatif"
                })
            }
            teacherUpdates = { ...teacherUpdates, salary };
        }

        if (typeof phone === "string") {
            if (!PHONE_PATTERN.test(phone)) {
                return res.status(400).send({
                    message: "Nomor telepon harus terdiri dari 11 sampai 13 digit angka"
                })
            }
            teacherUpdates = { ...teacherUpdates, phone };
        }

        if (typeof email === "string") {
            if (email.trim() === "") {
                return res.status(400).send({
                    message: "Email tidak boleh kosong"
                })
            }
            const normalizedEmail = email.trim().toLowerCase();
            const existingTeacherWithEmail = await prisma.teacher.findUnique({
                where: { email: normalizedEmail }
            })
            if (existingTeacherWithEmail && existingTeacherWithEmail.id !== teacherId) {
                return res.status(409).send({
                    message: "Email sudah digunakan oleh guru lain"
                })
            }
            teacherUpdates = { ...teacherUpdates, email: normalizedEmail };
        }

        if (typeof address === "string") {
            if (address.trim() === "") {
                return res.status(400).send({
                    message: "Alamat tidak boleh kosong"
                })
            }
            teacherUpdates = { ...teacherUpdates, address: address.trim() };
        }

        if (classId !== undefined) {
            if (classId === null || classId === "") {
                teacherUpdates = { ...teacherUpdates, classId: null };
            } else {
                const parsedClassId = Number(classId);
                if (!Number.isInteger(parsedClassId) || parsedClassId <= 0) {
                    return res.status(400).send({
                        message: "Data classId harus merupakan angka bulat positif"
                    })
                }
                const existingClass = await prisma.class.findFirst({
                    where: { id: parsedClassId, userId: currentUserId }
                })
                if (!existingClass) {
                    return res.status(404).send({
                        message: "Data kelas tidak ditemukan"
                    })
                }
                teacherUpdates = { ...teacherUpdates, classId: parsedClassId };
            }
        }

        const updatedTeacher = await prisma.teacher.update({
            where: { id: teacherId, userId: currentUserId },
            data: teacherUpdates
        })
        return res.status(200).send({
            message: "Data berhasil diperbarui",
            data: updatedTeacher
        })
    } catch (err) {
        if (err.code === "P2002" && String(err.meta?.target).includes("email")) {
            return res.status(409).send({
                message: "Email sudah digunakan oleh guru lain"
            })
        }
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const deleteTeacher = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const teacherId = Number(req.params.id);
        if (!Number.isInteger(teacherId) || teacherId <= 0) {
            return res.status(400).send({
                message: "Parameter ID bukan merupakan angka valid"
            })
        }
        const existingTeacher = await prisma.teacher.findFirst({
            where: { userId: currentUserId, id: teacherId }
        })
        if (!existingTeacher) {
            return res.status(404).send({
                message: "Data tidak ditemukan"
            })
        }
        await prisma.teacher.deleteMany({
            where: { id: teacherId, userId: currentUserId }
        })
        return res.status(200).send({
            message: `Data ${existingTeacher.id} berhasil dihapus`
        })
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}
