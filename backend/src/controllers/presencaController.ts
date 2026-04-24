import { Request, Response } from 'express'
import { prisma } from '../prisma'
import { io } from '../server'

// Editar presença manualmente
export const editarPresenca = async (req: Request, res: Response) => {
  const { id } = req.params
  const { status, justificativa } = req.body
  const professor = (req as any).professor

  try {
    const presencaExiste = await prisma.presenca.findUnique({
      where: { id: Number(id) },
    })

    if (!presencaExiste) {
      return res.status(404).json({ erro: 'Presença não encontrada' })
    }

    // Valida o status
    const statusValidos = ['presente', 'falta', 'justificada']
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ erro: 'Status inválido. Use: presente, falta ou justificada' })
    }

    const presencaAtualizada = await prisma.presenca.update({
      where: { id: Number(id) },
      data: {
        status,
        editadoPor: professor.email,
      },
      include: { aluno: true, disciplina: true },
    })

    // Se mudou para justificada, não desconta pontos
    // Se mudou de presente para falta, desconta 10 pontos
    if (presencaExiste.status === 'presente' && status === 'falta') {
      await prisma.aluno.update({
        where: { id: presencaExiste.alunoId },
        data: { pontos: { decrement: 10 } },
      })
    }

    // Se mudou de falta para presente, adiciona 10 pontos
    if (presencaExiste.status === 'falta' && status === 'presente') {
      await prisma.aluno.update({
        where: { id: presencaExiste.alunoId },
        data: { pontos: { increment: 10 } },
      })
    }

    // Emite evento de auditoria para o Dashboard
    io.emit('presenca:editada', {
      presenca: presencaAtualizada,
      editadoPor: professor.email,
      justificativa: justificativa || null,
    })

    return res.json({
      message: 'Presença atualizada com sucesso!',
      presenca: presencaAtualizada,
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Lançar falta justificada para um aluno
export const lancarFaltaJustificada = async (req: Request, res: Response) => {
  const { alunoId, disciplinaId, data, justificativa } = req.body
  const professor = (req as any).professor

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: Number(alunoId) },
    })

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' })
    }

    const presenca = await prisma.presenca.create({
      data: {
        alunoId: Number(alunoId),
        turmaId: aluno.turmaId,
        disciplinaId: Number(disciplinaId),
        professorId: professor.id,
        status: 'justificada',
        editadoPor: professor.email,
        data: data ? new Date(data) : new Date(),
      },
      include: { aluno: true, disciplina: true },
    })

    return res.status(201).json({
      message: 'Falta justificada lançada com sucesso!',
      presenca,
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Listar histórico de edições (auditoria)
export const listarAuditoria = async (req: Request, res: Response) => {
  try {
    const edicoes = await prisma.presenca.findMany({
      where: {
        editadoPor: { not: null },
      },
      include: { aluno: true, disciplina: true },
      orderBy: { data: 'desc' },
      take: 50,
    })

    return res.json(edicoes)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}