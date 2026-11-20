import { prisma } from '../db/src/prisma/client.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).send({
                message: "Semua field wajib diisi",
            });
        }
        const { name, email, password } = req.body;
        if (!name || typeof name !== "string") {
            return res.status(400).send({
                message: "Nama wajib diisi",
            });
        }
        if (!email || typeof email !== "string") {
            return res.status(400).send({
                message: "Email wajib diisi",
            });
        }
        if (!password || typeof password !== "string") {
            return res.status(400).send({
                message: "Password wajib diisi",
            });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const checkUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (checkUser) {
            return res.status(409).send({
                message: "Email sudah pernah didaftarkan",
            });
        }
        const hashPassword = await bcrypt.hash(password, 12);
        const addUser = await prisma.user.create({
            data: { name: name.trim(), email: normalizedEmail, password: hashPassword },
        });
        return res.status(201).send({
            message: "Register akun telah berhasil",
        });
    } catch (err) {
        if (err.code === "P2002" && String(err.meta?.target).includes("email")) {
            return res.status(409).send({
                message: "Email sudah pernah didaftarkan",
            });
        }
        console.error(err);
        return res.status(500).send({
            message: "Internal server error",
        });
    }
};

export const login = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).send({
                message: "Semua field wajib diisi",
            });
        }
        const { email, password } = req.body;
        if (!email || typeof email !== "string") {
            return res.status(400).send({
                message: "Email wajib diisi",
            });
        }
        if (!password || typeof password !== "string") {
            return res.status(400).send({
                message: "Password wajib diisi",
            });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const findUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (!findUser) {
            return res.status(401).send({
                message: "Email yang anda masukkan salah",
            });
        }
        const checkPassword = await bcrypt.compare(password, findUser.password);
        if (!checkPassword) {
            return res.status(401).send({
                message: "Password yang anda masukkan salah",
            });
        }
        const key = process.env.JWT_SECRET;
        const payload = {
            id: findUser.id,
            name: findUser.name,
            email: findUser.email,
        };
        const token = jwt.sign(payload, key, { expiresIn: "5h" });
        return res.status(200).send({
            message: "Login berhasil",
            token: token,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: "Internal server error",
        });
    }
};
