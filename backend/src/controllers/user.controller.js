import { prisma } from '../db/src/prisma/client.js';
import bcrypt from 'bcryptjs';

const USER_PUBLIC_FIELDS = {
    email: true,
    name: true,
};

export const getUsers = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { email, name } = req.query;
        const userFilters = { id: currentUserId };

        if (email !== undefined) {
            if (typeof email !== "string" || email.trim() === "") {
                return res.status(400).send({
                    message: "Data email tidak valid"
                })
            }
            userFilters.email = email.trim().toLowerCase();
        }

        if (name !== undefined) {
            if (typeof name !== "string" || name.trim() === "") {
                return res.status(400).send({
                    message: "Data nama tidak valid"
                })
            }
            userFilters.name = name;
        }

        const users = await prisma.user.findMany({
            where: userFilters,
            select: USER_PUBLIC_FIELDS,
        })

        return res.status(200).send({
            message: "Data berhasil diambil",
            data: users
        })

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const getUserById = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const userId = Number(req.params.id);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).send({
                message: "Parameter ID bukan merupakan angka valid"
            })
        }
        if (userId !== currentUserId) {
            return res.status(404).send({
                message: "Data tidak ditemukan"
            })
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: USER_PUBLIC_FIELDS,
        })
        if (!user) {
            return res.status(404).send({
                message: "Data tidak ditemukan"
            })
        }
        return res.status(200).send({
            message: "Data berhasil diambil",
            data: user
        })

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const createUser = async (req, res) => {
    try {
        let userData = {};
        if (!req.body) {
            return res.status(401).send({
                message: "Tidak ada request yang dikirim"
            })
        }
        const { email, name, password } = req.body;

        if (!email || typeof email !== "string" || email.trim() === "") {
            return res.status(400).send({
                message: "Data email tidak valid atau wajib diisi"
            })
        }
        const normalizedEmail = email.trim().toLowerCase();
        const existingUserWithEmail = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        })
        if (existingUserWithEmail) {
            return res.status(409).send({
                message: "Email sudah digunakan oleh user lain"
            })
        }
        userData = { ...userData, email: normalizedEmail };

        if (!password || typeof password !== "string" || password.trim() === "") {
            return res.status(400).send({
                message: "Data password tidak valid atau wajib diisi"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        userData = { ...userData, password: hashedPassword };

        if (name !== undefined) {
            if (typeof name !== "string" || name.trim() === "") {
                return res.status(400).send({
                    message: "Data nama tidak valid"
                })
            }
            userData = { ...userData, name: name.trim() };
        }

        const createdUser = await prisma.user.create({
            data: userData,
            select: USER_PUBLIC_FIELDS,
        })
        return res.status(201).send({
            message: "Data berhasil ditambahkan",
            data: createdUser
        })
    } catch (err) {
        if (err.code === "P2002" && String(err.meta?.target).includes("email")) {
            return res.status(409).send({
                message: "Email sudah digunakan oleh user lain"
            })
        }
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const updateUser = async (req, res) => {
    try {
        let userUpdates = {};
        const currentUserId = req.user.id;
        const userId = Number(req.params.id);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).send({
                message: "Parameter ID bukan merupakan angka valid"
            })
        }
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: USER_PUBLIC_FIELDS,
        })
        if (!existingUser) {
            return res.status(404).send({
                message: "Data tidak ditemukan"
            })
        }
        if (userId !== currentUserId) {
            return res.status(403).send({
                message: "Anda tidak memiliki akses untuk mengubah data ini"
            })
        }
        if (!req.body) {
            return res.status(400).send({
                message: "Tidak ada request yang dikirim"
            })
        }
        const { email, name, password } = req.body;

        if (typeof email === "string") {
            if (email.trim() === "") {
                return res.status(400).send({
                    message: "Email tidak boleh kosong"
                })
            }
            const normalizedEmail = email.trim().toLowerCase();
            const existingUserWithEmail = await prisma.user.findUnique({
                where: { email: normalizedEmail }
            })
            if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
                return res.status(409).send({
                    message: "Email sudah digunakan oleh user lain"
                })
            }
            userUpdates = { ...userUpdates, email: normalizedEmail };
        }

        if (typeof name === "string") {
            if (name.trim() === "") {
                return res.status(400).send({
                    message: "Nama tidak boleh kosong"
                })
            }
            userUpdates = { ...userUpdates, name: name.trim() };
        }

        if (typeof password === "string") {
            if (password.trim() === "") {
                return res.status(400).send({
                    message: "Password tidak boleh kosong"
                })
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            userUpdates = { ...userUpdates, password: hashedPassword };
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: userUpdates,
            select: USER_PUBLIC_FIELDS,
        })
        return res.status(200).send({
            message: "Data berhasil diperbarui",
            data: updatedUser
        })
    } catch (err) {
        if (err.code === "P2002" && String(err.meta?.target).includes("email")) {
            return res.status(409).send({
                message: "Email sudah digunakan oleh user lain"
            })
        }
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const userId = Number(req.params.id);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).send({
                message: "Parameter ID bukan merupakan angka valid"
            })
        }
        if (userId !== currentUserId) {
            return res.status(403).send({
                message: "Anda tidak memiliki akses untuk menghapus data ini"
            })
        }
        const existingUser = await prisma.user.findFirst({
            where: { id: userId },
            include: {
                _count: {
                    select: { students: true, teachers: true, class: true }
                }
            }
        })
        if (!existingUser) {
            return res.status(404).send({
                message: "Data tidak ditemukan"
            })
        }
        if (existingUser._count.students > 0
            || existingUser._count.teachers > 0
            || existingUser._count.class > 0) {
            return res.status(409).send({
                message: "User masih memiliki siswa, guru, atau kelas sehingga tidak dapat dihapus"
            })
        }
        await prisma.user.delete({
            where: { id: userId }
        })
        return res.status(200).send({
            message: `Data ${existingUser.id} berhasil dihapus`
        })
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}
