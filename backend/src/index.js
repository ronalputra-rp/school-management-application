import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import classRoutes from './routes/class.route.js';
import studentRoutes from './routes/student.route.js';
import teacherRoutes from './routes/teacher.route.js';
import userRoutes from './routes/user.route.js';

const here = path.dirname(fileURLToPath(import.meta.url));

// Memuat .env dari root backend, bukan dari cwd proses.
dotenv.config({ path: path.resolve(here, '../.env') });

const app = express();

// Prisma mengembalikan BigInt; kirim sebagai angka biasa di response JSON.
app.set("json replacer", (key, value) =>
    typeof value === "bigint" ? Number(value) : value
);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => {
    return res.status(404).send({
        message: "Endpoint tidak ditemukan"
    })
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});

export default app;
