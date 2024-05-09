/*
  Warnings:

  - You are about to drop the column `userId` on the `Video` table. All the data in the column will be lost.
  - Made the column `displayName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_userId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "displayName" SET NOT NULL;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "userId";
