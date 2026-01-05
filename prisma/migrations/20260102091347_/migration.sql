/*
  Warnings:

  - A unique constraint covering the columns `[rememberToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rememberToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_rememberToken_key" ON "User"("rememberToken");
