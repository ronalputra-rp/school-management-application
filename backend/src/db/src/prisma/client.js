import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const here = path.dirname(fileURLToPath(import.meta.url));

// Memuat .env dari root package db, bukan dari cwd proses.
dotenv.config({ path: path.resolve(here, '../../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL belum diset di environment variables");
}

const adapter = new PrismaPg({
  connectionString,
});

export const prisma = new PrismaClient({ adapter });

export default prisma;
