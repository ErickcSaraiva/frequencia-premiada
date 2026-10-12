import { Request, Response } from 'express'
import { prisma } from '../prisma'

// Cadastrar turma vinculada ao professor autenticado
export const cadastrarTurma = async (req: Request, res: Response) => {
  const professor = req.user

  if (!professor) {
    return res.status(401).json({ erro: 'Usuário não autenticado' })
  }

  if (professor.role !== 'professor') {
    return res.status(403).json({ erro: 'Acesso não autorizado' })
  }

  const nome = typeof req.body?.nome === 'string'
    ? req.body.nome.trim()
    : ''

  if (!nome) {
    return res.status(400).json({ erro: 'Informe o nome da turma' })
  }

  try {
    const turma = await prisma.turma.create({
      data: {
        nome,
        professorId: professor.id,
      },
    })

    return res.status(201).json({
      message: 'Turma cadastrada com sucesso!',
      turma,
    })
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}
// Administração vê todas; professor vê suas próprias turmas.
export const listarTurmas = async (req: Request, res: Response) => {
  const usuario = req.user

  if (!usuario) {
    return res.status(401).json({ erro: 'Usuário não autenticado' })
  }

  if (usuario.role !== 'professor' && usuario.role !== 'admin') {
    return res.status(403).json({ erro: 'Acesso não autorizado' })
  }

  try {
    const turmas = await prisma.turma.findMany({
      where: usuario.role === 'admin'
        ? {}
        : { professorId: usuario.id },
      orderBy: { nome: 'asc' },
    })

    return res.json(turmas)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

// Ranking de turmas por pontos acumulados dos alunos
export const rankingTurmas = async (req: Request, res: Response) => {
  try {
    const turmas = await prisma.turma.findMany({
      include: {
        alunos: {
          select: {
            pontos: true,
          },
        },
      },
    })

    const ranking = turmas
      .map((turma) => ({
        id: turma.id,
        nome: turma.nome,
        pontos: turma.alunos.reduce((total, aluno) => total + aluno.pontos, 0),
        totalAlunos: turma.alunos.length,
      }))
      .sort((a, b) => b.pontos - a.pontos)

    return res.json(ranking)
  } catch (error) {
    return res.status(500).json({ erro: 'Erro interno do servidor ao gerar ranking de turmas' })
  }
}
