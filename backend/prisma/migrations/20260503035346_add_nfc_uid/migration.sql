/*
  Warnings:

  - The primary key for the `Aluno` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tag_nfc` on the `Aluno` table. All the data in the column will be lost.
  - The primary key for the `Presenca` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `disciplinaId` on the `Presenca` table. All the data in the column will be lost.
  - You are about to drop the column `professorId` on the `Presenca` table. All the data in the column will be lost.
  - The primary key for the `Turma` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Disciplina` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Professor` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[matricula]` on the table `Aluno` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nfc_uid]` on the table `Aluno` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `matricula` to the `Aluno` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Aluno" DROP CONSTRAINT "Aluno_turmaId_fkey";

-- DropForeignKey
ALTER TABLE "Presenca" DROP CONSTRAINT "Presenca_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "Presenca" DROP CONSTRAINT "Presenca_disciplinaId_fkey";

-- DropForeignKey
ALTER TABLE "Presenca" DROP CONSTRAINT "Presenca_professorId_fkey";

-- DropForeignKey
ALTER TABLE "Presenca" DROP CONSTRAINT "Presenca_turmaId_fkey";

-- DropIndex
DROP INDEX "Aluno_tag_nfc_key";

-- AlterTable
ALTER TABLE "Aluno" DROP CONSTRAINT "Aluno_pkey",
DROP COLUMN "tag_nfc",
ADD COLUMN     "matricula" TEXT NOT NULL,
ADD COLUMN     "nfc_uid" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "turmaId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Aluno_id_seq";

-- AlterTable
ALTER TABLE "Presenca" DROP CONSTRAINT "Presenca_pkey",
DROP COLUMN "disciplinaId",
DROP COLUMN "professorId",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "alunoId" SET DATA TYPE TEXT,
ALTER COLUMN "turmaId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Presenca_id_seq";

-- AlterTable
ALTER TABLE "Turma" DROP CONSTRAINT "Turma_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Turma_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Turma_id_seq";

-- DropTable
DROP TABLE "Disciplina";

-- DropTable
DROP TABLE "Professor";

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_matricula_key" ON "Aluno"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_nfc_uid_key" ON "Aluno"("nfc_uid");

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
