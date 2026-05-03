-- AlterTable
ALTER TABLE "Turma" ADD COLUMN     "disciplinaId" TEXT;

-- CreateTable
CREATE TABLE "Disciplina" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Disciplina_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE SET NULL ON UPDATE CASCADE;
