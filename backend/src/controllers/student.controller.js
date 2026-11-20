import { prisma } from '../db/src/prisma/client.js';

const NISN_PATTERN = /^\d{10}$/;

export const getStudents = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const {
            nisn,
            studentNumber,
            gender,
            minBirthDate,
            maxBirthDate,
            birthPlace,
            address,
        } = req.query;
        let studentFilters = { userId: currentUserId };

        if (nisn !== undefined) {
            const parsedNisn = Number(nisn);
            if (Number.isNaN(parsedNisn)) {
                return res.status(400).send({
                    message: "Data NISN harus merupakan angka"
                })
            }
            if (!Number.isInteger(parsedNisn)) {
                return res.status(400).send({
                    message: "NISN harus berupa bilangan bulat"
                })
            }
            if (!NISN_PATTERN.test(nisn)) {
                return res.status(400).send({
                    message: "NISN harus memiliki 10 digit angka"
                })
            }
            studentFilters = { ...studentFilters, nisn: BigInt(parsedNisn) };
        }

        if (studentNumber !== undefined) {
            const parsedStudentNumber = Number(studentNumber);
            if (Number.isNaN(parsedStudentNumber)) {
                return res.status(400).send({
                    message: "Data studentNumber harus merupakan angka"
                })
            }
            if (!Number.isInteger(parsedStudentNumber)) {
                return res.status(400).send({
                    message: "studentNumber harus berupa bilangan bulat"
                })
            }
            studentFilters = { ...studentFilters, studentNumber: parsedStudentNumber };
        }

        if (gender !== undefined) {
            if (typeof gender !== "string") {
                return res.status(400).send({
                    message: "Data jenis kelamin harus merupakan string"
                })
            }
            if (gender.trim() === "") {
                return res.status(400).send({
                    message: "Data tidak boleh diisi dengan input kosong"
                })
            }
            studentFilters = { ...studentFilters, gender };
        }

        let birthDateRange = {};

        if (minBirthDate !== undefined) {
            if (typeof minBirthDate !== "string") {
                return res.status(400).send({
                    message: "Data tanggal tidak valid"
                })
            }
            const parsedMinBirthDate = new Date(minBirthDate);
            if (Number.isNaN(parsedMinBirthDate.getTime())) {
                return res.status(400).send({
                    message: "Data yang dikirim bukan merupakan sebuah tanggal"
                })
            }
            birthDateRange = { ...birthDateRange, gte: parsedMinBirthDate };
        }

        if (maxBirthDate !== undefined) {
            if (typeof maxBirthDate !== "string") {
                return res.status(400).send({
                    message: "Data tanggal tidak valid"
                })
            }
            const parsedMaxBirthDate = new Date(maxBirthDate);
            if (Number.isNaN(parsedMaxBirthDate.getTime())) {
                return res.status(400).send({
                    message: "Data yang dikirim bukan merupakan sebuah tanggal"
                })
            }
            birthDateRange = { ...birthDateRange, lte: parsedMaxBirthDate };
        }

        if (Object.keys(birthDateRange).length > 0) {
            studentFilters = { ...studentFilters, birthDate: birthDateRange };
        }

        if (birthPlace !== undefined) {
            if (typeof birthPlace !== "string" || birthPlace.trim() === "") {
                return res.status(400).send({
                    message: "Data tempat lahir tidak valid"
                })
            }
            studentFilters = {
                ...studentFilters,
                birthPlace: { contains: birthPlace.trim(), mode: "insensitive" }
            };
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
            studentFilters = { ...studentFilters, address };
        }

        const students = await prisma.student.findMany({
            where: studentFilters
        })

        return res.status(200).send({
            message: "Data berhasil diambil",
            data: students
        })

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const getStudentById = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const studentId = Number(req.params.id);
        if (!Number.isInteger(studentId) || studentId <= 0) {
            return res.status(400).send({
                message: "Parameter ID bukan merupakan angka valid"
            })
        }
        const student = await prisma.student.findFirst({
            where: { userId: currentUserId, id: studentId }
        })
        if (!student) {
            return res.status(404).send({
                message: "Data tidak ditemukan"
            })
        }
        return res.status(200).send({
            message: "Data berhasil diambil",
            data: student
        })

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const createStudent = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        let studentData = { userId: currentUserId };
        if (!req.body) {
            return res.status(401).send({
                message: "Tidak ada request yang dikirim"
            })
        }
        const {
            name,
            studentNumber,
            nisn,
            gender,
            birthDate,
            birthPlace,
            address,
            classId,
        } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).send({
                message: "Data nama tidak valid atau nama wajib diisi"
            })
        }
        studentData = { ...studentData, name: name.trim() };

        if (!studentNumber || typeof studentNumber !== "number") {
            return res.status(400).send({
                message: "Data studentNumber harus merupakan angka"
            })
        }
        if (!Number.isInteger(studentNumber)) {
            return res.status(400).send({
                message: "studentNumber harus berupa bilangan bulat"
            })
        }
        studentData = { ...studentData, studentNumber };

        if (!nisn || typeof nisn !== "number") {
            return res.status(400).send({
                message: "Data NISN harus merupakan angka"
            })
        }
        if (!Number.isInteger(nisn)) {
            return res.status(400).send({
                message: "NISN harus berupa bilangan bulat"
            })
        }
        if (!NISN_PATTERN.test(String(nisn))) {
            return res.status(400).send({
                message: "NISN harus memiliki 10 digit angka"
            })
        }
        const nisnValue = BigInt(nisn);
        const existingStudentWithNisn = await prisma.student.findUnique({
            where: { nisn: nisnValue }
        })
        if (existingStudentWithNisn) {
            return res.status(409).send({
                message: "NISN sudah digunakan oleh siswa lain"
            })
        }
        studentData = { ...studentData, nisn: nisnValue };

        if (!gender || typeof gender !== "string" || gender.trim() === "") {
            return res.status(400).send({
                message: "Data jenis kelamin tidak valid atau wajib diisi"
            })
        }
        studentData = { ...studentData, gender: gender.trim() };

        if (classId === undefined || classId === null || classId === "") {
            studentData = { ...studentData, classId: null };
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
            studentData = { ...studentData, classId };
        }

        if (birthDate !== undefined) {
            if (typeof birthDate !== "string") {
                return res.status(400).send({
                    message: "Data tanggal tidak valid"
                })
            }
            const parsedBirthDate = new Date(birthDate);
            if (Number.isNaN(parsedBirthDate.getTime())) {
                return res.status(400).send({
                    message: "Data yang dikirim bukan merupakan sebuah tanggal"
                })
            }
            studentData = { ...studentData, birthDate: parsedBirthDate };
        }

        if (birthPlace !== undefined) {
            if (typeof birthPlace !== "string" || birthPlace.trim() === "") {
                return res.status(400).send({
                    message: "Data tempat lahir tidak valid"
                })
            }
            studentData = { ...studentData, birthPlace: birthPlace.trim() };
        }

        if (address !== undefined) {
            if (typeof address !== "string" || address.trim() === "") {
                return res.status(400).send({
                    message: "Data alamat tidak valid"
                })
            }
            studentData = { ...studentData, address: address.trim() };
        }

        const createdStudent = await prisma.student.create({
            data: studentData
        })
        return res.status(201).send({
            message: "Data berhasil ditambahkan",
            data: createdStudent
        })
    } catch (err) {
        if (err.code === "P2002" && String(err.meta?.target).includes("nisn")) {
            return res.status(409).send({
                message: "NISN sudah digunakan oleh siswa lain"
            })
        }
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const updateStudent = async (req, res) => {
    try {
        let studentUpdates = {};
        const currentUserId = req.user.id;
        const studentId = Number(req.params.id);
        if (!Number.isInteger(studentId) || studentId <= 0) {
            return res.status(400).send({
                message: "Parameter ID bukan merupakan angka valid"
            })
        }
        const existingStudent = await prisma.student.findFirst({
            where: { id: studentId, userId: currentUserId }
        })
        if (!existingStudent) {
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
            studentNumber,
            nisn,
            gender,
            birthDate,
            birthPlace,
            address,
            classId,
        } = req.body;

        if (typeof name === "string") {
            if (name.trim() === "") {
                return res.status(400).send({
                    message: "Nama tidak boleh kosong"
                })
            }
            studentUpdates = { ...studentUpdates, name: name.trim() };
        }

        if (typeof studentNumber === "number") {
            if (!Number.isInteger(studentNumber)) {
                return res.status(400).send({
                    message: "studentNumber harus berupa bilangan bulat"
                })
            }
            studentUpdates = { ...studentUpdates, studentNumber };
        }

        if (typeof nisn === "number") {
            if (!Number.isInteger(nisn)) {
                return res.status(400).send({
                    message: "NISN harus berupa bilangan bulat"
                })
            }
            if (!NISN_PATTERN.test(String(nisn))) {
                return res.status(400).send({
                    message: "NISN harus memiliki 10 digit angka"
                })
            }
            const nisnValue = BigInt(nisn);
            const existingStudentWithNisn = await prisma.student.findUnique({
                where: { nisn: nisnValue }
            })
            if (existingStudentWithNisn && existingStudentWithNisn.id !== studentId) {
                return res.status(409).send({
                    message: "NISN sudah digunakan oleh siswa lain"
                })
            }
            studentUpdates = { ...studentUpdates, nisn: nisnValue };
        }

        if (typeof gender === "string") {
            if (gender.trim() === "") {
                return res.status(400).send({
                    message: "Jenis kelamin tidak boleh kosong"
                })
            }
            studentUpdates = { ...studentUpdates, gender: gender.trim() };
        }

        if (classId !== undefined) {
            if (classId === null || classId === "") {
                studentUpdates = { ...studentUpdates, classId: null };
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
                studentUpdates = { ...studentUpdates, classId: parsedClassId };
            }
        }

        if (typeof birthDate === "string") {
            const parsedBirthDate = new Date(birthDate);
            if (Number.isNaN(parsedBirthDate.getTime())) {
                return res.status(400).send({
                    message: "Data yang dikirim bukan merupakan sebuah tanggal"
                })
            }
            studentUpdates = { ...studentUpdates, birthDate: parsedBirthDate };
        }

        if (typeof birthPlace === "string") {
            if (birthPlace.trim() === "") {
                return res.status(400).send({
                    message: "Tempat lahir tidak boleh kosong"
                })
            }
            studentUpdates = { ...studentUpdates, birthPlace: birthPlace.trim() };
        }

        if (typeof address === "string") {
            if (address.trim() === "") {
                return res.status(400).send({
                    message: "Alamat tidak boleh kosong"
                })
            }
            studentUpdates = { ...studentUpdates, address: address.trim() };
        }

        const updatedStudent = await prisma.student.update({
            where: { id: studentId, userId: currentUserId },
            data: studentUpdates
        })
        return res.status(200).send({
            message: "Data berhasil diperbarui",
            data: updatedStudent
        })
    } catch (err) {
        if (err.code === "P2002" && String(err.meta?.target).includes("nisn")) {
            return res.status(409).send({
                message: "NISN sudah digunakan oleh siswa lain"
            })
        }
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const deleteStudent = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const studentId = Number(req.params.id);
        if (!Number.isInteger(studentId) || studentId <= 0) {
            return res.status(400).send({
                message: "Parameter ID bukan merupakan angka valid"
            })
        }
        const existingStudent = await prisma.student.findFirst({
            where: { id: studentId, userId: currentUserId }
        })
        if (!existingStudent) {
            return res.status(404).send({
                message: "Data tidak ditemukan"
            })
        }
        await prisma.student.deleteMany({
            where: { id: studentId, userId: currentUserId }
        })
        return res.status(200).send({
            message: `Data ${existingStudent.id} berhasil dihapus`
        })
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}
