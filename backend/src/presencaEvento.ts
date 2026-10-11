import { Presenca } from '@prisma/client'

// O socket transmite apenas a chave do registro e campos úteis à reconciliação.
// Dados de identificação são obtidos pela consulta autenticada do painel.
export function presencaEvento(p: Presenca) {
  return { id: p.id, alunoId: p.alunoId, turmaId: p.turmaId, status: p.status, data: p.data }
}
