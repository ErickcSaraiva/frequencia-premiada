import { Request, Response } from 'express'
import { prisma } from '../prisma'

const FUSO = 'America/Manaus'
const LIMITE_FEED = 20

// Manaus usa UTC-04:00. O período semiaberto evita incluir a meia-noite seguinte.
export function periodoHoje(agora = new Date()) {
  const dia = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(agora)
  const inicio = new Date(`${dia}T00:00:00-04:00`)
  const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000)
  return { inicio, fim }
}

export const resumoPainel = async (_req: Request, res: Response) => {
  try {
    const { inicio, fim } = periodoHoje()
    const [checkinsHoje, totalAlunos, alunos, turmas, feed] = await Promise.all([
      prisma.presenca.count({ where: { status: 'presente', data: { gte: inicio, lt: fim } } }),
      prisma.aluno.count(),
      prisma.aluno.findMany({
        select: {
          id: true, nome: true, apelido: true, turma: { select: { nome: true } },
          presencas: { select: { status: true }, orderBy: [{ data: 'desc' }, { id: 'desc' }], take: 3 },
        },
      }),
      prisma.turma.findMany({
        select: { id: true, nome: true, alunos: { select: { pontos: true } } },
      }),
      prisma.presenca.findMany({
        where: { status: 'presente' },
        select: {
          id: true, data: true, status: true, alunoId: true, turmaId: true,
          aluno: { select: { nome: true, apelido: true } },
          turma: { select: { nome: true } },
        },
        orderBy: [{ data: 'desc' }, { id: 'desc' }], take: LIMITE_FEED,
      }),
    ])
    const identificacao = (nome: string, apelido: string | null) => {
  // Preserva o apelido quando estiver cadastrado.
  const apelidoLimpo = apelido?.trim()
  if (apelidoLimpo) return apelidoLimpo

  // Sem apelido, mostra primeiro e último nome.
  const partes = nome.trim().split(/\s+/).filter(Boolean)

  if (partes.length === 0) return 'Aluno'
  if (partes.length === 1) return partes[0]

  return `${partes[0]} ${partes[partes.length - 1]}`
}
    const risco = alunos.filter(aluno =>
      aluno.presencas.length === 3 && aluno.presencas.every(p => p.status === 'falta'),
    )
    res.json({
      periodo: { inicio, fim, fusoHorario: FUSO },
      checkinsHoje, totalAlunos, totalRisco: risco.length,
      alunosRisco: risco.map(a => ({ id: a.id, identificacao: identificacao(a.nome, a.apelido), turma: a.turma.nome })),
      ranking: turmas.map(t => ({
        id: t.id, nome: t.nome, pontos: t.alunos.reduce((total, a) => total + a.pontos, 0), totalAlunos: t.alunos.length,
      })).sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome)),
      feed: feed.map(p => ({
        id: p.id, data: p.data, status: p.status, alunoId: p.alunoId, turmaId: p.turmaId,
        identificacao: identificacao(p.aluno.nome, p.aluno.apelido), turma: p.turma.nome,
      })),
      limiteFeed: LIMITE_FEED,
    })
  } catch {
    res.status(500).json({ erro: 'Erro ao consultar o painel' })
  }
}
