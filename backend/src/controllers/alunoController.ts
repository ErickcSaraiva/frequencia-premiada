import { Request, Response } from 'express'
import { prisma } from '../prisma'

// Cadastrar aluno
export const cadastrarAluno = async (req: Request, res: Response) => {
  const { nome, tag_nfc, turmaId } = req.body

  try {
    const tagExiste = await prisma.aluno.findUnique({
      where: { tag_nfc },
    })

    if (tagExiste) {
      return res.status(400).json({ erro: 'Essa tag NFC já está cadastrada' })
    }

    const aluno = await prisma.aluno.create({
      data: { nome, tag_nfc, turmaId },
    })

    return res.status(201).json({
      message: 'Aluno cadastrado com sucesso!',
      aluno,
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Listar alunos por turma
export const listarAlunosPorTurma = async (req: Request, res: Response) => {
  const { turmaId } = req.params

  try {
    const alunos = await prisma.aluno.findMany({
      where: { turmaId: Number(turmaId) },
      orderBy: { nome: 'asc' },
    })

    return res.json(alunos)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Buscar aluno por tag NFC
export const buscarAlunoPorTag = async (req: Request, res: Response) => {
  const tag_nfc = req.params.tag_nfc as string

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { tag_nfc },
      include: { turma: true },
    })

    if (!aluno) {
      return res.status(404).json({ erro: 'Tag NFC não encontrada' })
    }

    return res.json(aluno)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}
// Ranking de pontos por turma
export const rankingPorTurma = async (req: Request, res: Response) => {
  const { turmaId } = req.params

  try {
    const alunos = await prisma.aluno.findMany({
      where: { turmaId: Number(turmaId) },
      orderBy: { pontos: 'desc' },
      include: { turma: true },
    })

    return res.json(alunos)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}