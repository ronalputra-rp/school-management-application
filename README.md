# School Management Application

Aplikasi manajemen sekolah berbasis React + Vite (frontend) dan Express + Prisma (backend) dengan PostgreSQL.

## Fitur utama

- Autentikasi register/login dengan JWT dan bcryptjs
- CRUD siswa, guru, dan kelas
- Tampilan siswa & guru dikelompokkan per kelas, dengan expand/collapse per grup
- Rekap gabungan siswa & guru di halaman `Siswa & Guru`
- NISN unik bertipe `BigInt` (mendukung seluruh rentang 10 digit)
- Nama kelas unik per pengguna, otomatis uppercase dan trim
- Menghapus kelas membuat siswa/guru menjadi "Tanpa kelas" (`SET NULL`),
  bukan menghapus datanya
- Halaman pengguna hanya menampilkan nama dan email

## Struktur

```text
backend/
  middlewares/        # verifikasi JWT
  src/controllers/    # logika bisnis
  src/routes/         # routing Express
  src/db/prisma/      # schema, config, dan migrations
frontend/client/      # aplikasi React + Vite
```

## Setup

Butuh Node.js dan PostgreSQL.

1. Install dependensi:

```powershell
npm install
npm --prefix backend install
npm --prefix backend/src/db install
npm --prefix frontend/client install
```

2. Siapkan environment (jangan commit file `.env`):

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item backend\src\db\.env.example backend\src\db\.env
```

Isi `JWT_SECRET` di `backend/.env` dan `DATABASE_URL` di `backend/src/db/.env`.

3. Siapkan database:

```powershell
cd backend/src/db
npx prisma generate
npx prisma migrate deploy
```

4. Jalankan aplikasi:

```powershell
# dari root: backend di :5000
npm run dev:backend

# dari root: frontend di :5173
npm run dev
```

## API

Endpoint publik:

- `POST /api/auth/register`
- `POST /api/auth/login`

Seluruh endpoint lain memakai header:

```text
Authorization: Bearer <token>
```

Route utama: `/api/classes`, `/api/students`, `/api/teachers`, `/api/users`.

## Catatan

Prisma Client dihasilkan ke `node_modules`, jadi tidak ikut di-commit.
Jalankan `npx prisma generate` setelah clone/install.
Semua perubahan skema tersimpan di `backend/src/db/prisma/migrations`.
