
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import classRoutes from './routes/class.route.js';
import studentRoutes from './routes/student.route.js';
import teacherRoutes from './routes/teacher.route.js';
import parentRoutes from './routes/parents.route.js';
import userRoutes from './routes/user.route.js';

const here = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(here, '../.env') });

const app = express();

app.set("json replacer", (key, value) =>
    typeof value === "bigint" ? Number(value) : value
);

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/users', userRoutes);

// Frontend static files
const frontendPath = path.resolve(
    here,
    '../../frontend/client/dist'
);

app.use(express.static(frontendPath));

// React Router fallback
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            message: "Endpoint tidak ditemukan"
        });
    }

    return res.sendFile(path.join(frontendPath, 'index.html'));
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});

export default app;
