import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'

export const login = async (req: Request, res: Response) => {
  const email =
    typeof req.body.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : ''

  const senha =
    typeof req.body.senha === 'string' ? req.body.senha : ''

  if (!email || !senha) {
    return res.status(400).json({
      erro: 'Email e senha são obrigatórios',
    })
  }

  try {
    const professor = await prisma.professor.findUnique({
      where: { email },
    })

    if (!professor) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos',
      })
    }

    const senhaValida = await bcrypt.compare(senha, professor.senha)

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos',
      })
    }

    const token = jwt.sign(
      {
        id: professor.id,
        role: 'professor',
        email: professor.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    )

    return res.json({
      message: 'Login realizado com sucesso!',
      token,
      professor: {
        id: professor.id,
        nome: professor.nome,
        email: professor.email,
      },
    })
  } catch (error) {
    console.error('Erro ao autenticar professor:', error)

    return res.status(500).json({
      erro: 'Erro interno do servidor',
    })
  }
}

export const loginProfessor = login
