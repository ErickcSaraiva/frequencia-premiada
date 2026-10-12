-- Perfis permitidos para as contas da equipe.
CREATE TYPE "PerfilEquipe" AS ENUM ('professor', 'admin');

-- Contas existentes permanecem com o perfil professor.
ALTER TABLE "Professor"
ADD COLUMN "perfil" "PerfilEquipe" NOT NULL DEFAULT 'professor';
