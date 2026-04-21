import { Request, Response } from 'express'
import { prisma } from '../prisma'

// Cadastrar turma
export const cadastrarTurma = async (req: Request, res: Response) => {
  const { nome } = req.body

  try {
    const turma = await prisma.turma.create({
      data: { nome },
    })

    return res.status(201).json({
      message: 'Turma cadastrada com sucesso!',
      turma,
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Listar todas as turmas
export const listarTurmas = async (req: Request, res: Response) => {
  try {
    const turmas = await prisma.turma.findMany({
      orderBy: { nome: 'asc' },
    })

    return res.json(turmas)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}