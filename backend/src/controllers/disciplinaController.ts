import { Request, Response } from 'express'
import { prisma } from '../prisma'

// Cadastrar disciplina
export const cadastrarDisciplina = async (req: Request, res: Response) => {
  const { nome } = req.body

  try {
    const disciplina = await prisma.disciplina.create({
      data: { nome },
    })

    return res.status(201).json({
      message: 'Disciplina cadastrada com sucesso!',
      disciplina,
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Listar todas as disciplinas
export const listarDisciplinas = async (req: Request, res: Response) => {
  try {
    const disciplinas = await prisma.disciplina.findMany({
      orderBy: { nome: 'asc' },
    })

    return res.json(disciplinas)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}