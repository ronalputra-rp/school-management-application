-- CreateTable
CREATE TABLE "Parents" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "studentId" INTEGER,

    CONSTRAINT "Parents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Parents_userId_idx" ON "Parents"("userId");

-- CreateIndex
CREATE INDEX "Parents_studentId_idx" ON "Parents"("studentId");

-- AddForeignKey
ALTER TABLE "Parents" ADD CONSTRAINT "Parents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parents" ADD CONSTRAINT "Parents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
