/*
  Warnings:

  - A unique constraint covering the columns `[userId,className]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
*/
-- CreateIndex
CREATE UNIQUE INDEX "Class_userId_className_key" ON "Class"("userId", "className");
