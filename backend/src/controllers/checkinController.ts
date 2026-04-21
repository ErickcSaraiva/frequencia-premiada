import { Request, Response } from 'express'
import { prisma } from '../prisma'
import { io } from '../server'

// Registrar check-in via tag NFC
export const registrarCheckin = async (req: Request, res: Response) => {
  const { tag_nfc, disciplinaId } = req.body
  const professorId = (req as any).professor.id

  try {
    // Busca o aluno pela tag NFC
    const aluno = await prisma.aluno.findUnique({
      where: { tag_nfc },
      include: { turma: true },
    })

    if (!aluno) {
      return res.status(404).json({ erro: 'Tag NFC não encontrada' })
    }

    // Verifica se já fez check-in hoje nessa disciplina
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const checkinExiste = await prisma.presenca.findFirst({
      where: {
        alunoId: aluno.id,
        disciplinaId: Number(disciplinaId),
        data: { gte: hoje },
        status: 'presente',
      },
    })

    if (checkinExiste) {
      return res.status(400).json({ erro: 'Aluno já registrou presença hoje nessa disciplina' })
    }

    // Registra a presença
    const presenca = await prisma.presenca.create({
      data: {
        alunoId: aluno.id,
        turmaId: aluno.turmaId,
        disciplinaId: Number(disciplinaId),
        professorId,
        status: 'presente',
      },
    })

    // Atualiza os pontos do aluno (+10)
    const alunoAtualizado = await prisma.aluno.update({
      where: { id: aluno.id },
      data: { pontos: { increment: 10 } },
    })

    // Verifica risco de evasão (3+ faltas consecutivas)
    const ultimasPresencas = await prisma.presenca.findMany({
      where: { alunoId: aluno.id },
      orderBy: { data: 'desc' },
      take: 3,
    })

    const emRisco = ultimasPresencas.length === 3 &&
      ultimasPresencas.every(p => p.status === 'falta')

    // Emite evento em tempo real para o Dashboard
    io.emit('checkin', {
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        pontos: alunoAtualizado.pontos,
        turma: aluno.turma.nome,
      },
      emRisco,
      horario: new Date().toISOString(),
    })

    return res.status(201).json({
      message: 'Presença registrada com sucesso!',
      pontos: alunoAtualizado.pontos,
      emRisco,
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Listar presenças por turma
export const listarPresencasPorTurma = async (req: Request, res: Response) => {
  const { turmaId } = req.params

  try {
    const presencas = await prisma.presenca.findMany({
      where: { turmaId: Number(turmaId) },
      include: { aluno: true, disciplina: true },
      orderBy: { data: 'desc' },
    })

    return res.json(presencas)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Listar alunos em risco de evasão
export const listarAlunosEmRisco = async (req: Request, res: Response) => {
  try {
    const alunos = await prisma.aluno.findMany({
      include: {
        presencas: {
          orderBy: { data: 'desc' },
          take: 3,
        },
        turma: true,
      },
    })

    const alunosEmRisco = alunos.filter(aluno => {
      const ultimas = aluno.presencas
      return ultimas.length === 3 && ultimas.every(p => p.status === 'falta')
    })

    return res.json(alunosEmRisco)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}