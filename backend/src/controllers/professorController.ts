import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../prisma'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TAMANHO_MINIMO_SENHA = 12
const LIMITE_BCRYPT_BYTES = 72

export const cadastrarProfessor = async (req: Request, res: Response) => {
  const nome =
    typeof req.body.nome === 'string' ? req.body.nome.trim() : ''

  const email =
    typeof req.body.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : ''

  const senha =
    typeof req.body.senha === 'string' ? req.body.senha : ''

  if (!nome || !email || !senha.trim()) {
    return res.status(400).json({
      erro: 'Nome, e-mail e senha são obrigatórios',
    })
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      erro: 'Informe um e-mail válido',
    })
  }

  if (senha.length < TAMANHO_MINIMO_SENHA) {
    return res.status(400).json({
      erro: `A senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres`,
    })
  }

  if (Buffer.byteLength(senha, 'utf8') > LIMITE_BCRYPT_BYTES) {
    return res.status(400).json({
      erro: `A senha deve ter no máximo ${LIMITE_BCRYPT_BYTES} bytes`,
    })
  }

  try {
    const professorExiste = await prisma.professor.findUnique({
      where: { email },
    })

    if (professorExiste) {
      return res.status(409).json({
        erro: 'Este e-mail já está cadastrado',
      })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const professor = await prisma.professor.create({
      data: {
        nome,
        email,
        senha: senhaHash,
      },
    })

    return res.status(201).json({
      message: 'Professor cadastrado com sucesso!',
      professor: {
        id: professor.id,
        nome: professor.nome,
        email: professor.email,
      },
    })
  } catch (error) {
    console.error('Erro ao cadastrar professor:', error)

    return res.status(500).json({
      erro: 'Erro interno ao cadastrar professor',
    })
  }
}
