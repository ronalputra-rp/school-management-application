import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const here = path.dirname(fileURLToPath(import.meta.url));

// Memuat .env dari root package db, bukan dari cwd proses.
dotenv.config({ path: path.resolve(here, '../../.env') });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });

export default prisma;
