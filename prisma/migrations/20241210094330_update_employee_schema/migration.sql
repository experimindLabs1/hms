/*
  Warnings:

  - The primary key for the `Attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `employeeId` on the `Attendance` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `Attendance` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountHolderName` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `accountNumber` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `accountType` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfJoining` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `fatherName` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `ifsc` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `pan` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMode` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `personalEmail` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `residentialAddress` on the `Employee` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Attendance" ("createdAt", "date", "employeeId", "id", "status", "updatedAt") SELECT "createdAt", "date", "employeeId", "id", "status", "updatedAt" FROM "Attendance";
DROP TABLE "Attendance";
ALTER TABLE "new_Attendance" RENAME TO "Attendance";
CREATE TABLE "new_Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Employee" ("createdAt", "email", "firstName", "id", "lastName", "position", "updatedAt") SELECT "createdAt", "email", "firstName", "id", "lastName", "position", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
