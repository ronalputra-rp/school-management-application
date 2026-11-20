-- AlterTable
-- Konversi nilai datetime lama menjadi teks agar data tidak hilang.
ALTER TABLE "Student"
ALTER COLUMN "birthPlace" SET DATA TYPE TEXT
USING "birthPlace"::text;
