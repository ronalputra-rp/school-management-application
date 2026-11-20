import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

const here = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(here, '.env') });

export default defineConfig({
  schema: path.resolve(here, 'prisma/schema.prisma'),
  migrations: {
    path: path.resolve(here, 'prisma/migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
