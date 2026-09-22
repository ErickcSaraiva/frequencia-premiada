import { describe, expect, it, jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import request from 'supertest'

jest.mock('../src/prisma', () => ({
  prisma: {},
}))

import { app } from '../src/server'

const criarTokenAluno = () =>
  jwt.sign(
    {
      id: 'aluno-de-teste',
      role: 'aluno',
      matricula: 'ALUNO001',
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '5m' },
  )

describe('Autorização das consultas administrativas', () => {
  it('impede aluno de listar estudantes de uma turma', async () => {
    const response = await request(app)
      .get('/alunos/turma/turma-1')
      .set('Authorization', `Bearer ${criarTokenAluno()}`)

    expect(response.status).toBe(403)
    expect(response.body.erro).toBe('Acesso não autorizado')
  })

  it('impede aluno de consultar estudante por tag NFC', async () => {
    const response = await request(app)
      .get('/alunos/tag/A1B2C3D4')
      .set('Authorization', `Bearer ${criarTokenAluno()}`)

    expect(response.status).toBe(403)
    expect(response.body.erro).toBe('Acesso não autorizado')
  })

  it('impede aluno de listar todas as turmas', async () => {
    const response = await request(app)
      .get('/turmas')
      .set('Authorization', `Bearer ${criarTokenAluno()}`)

    expect(response.status).toBe(403)
    expect(response.body.erro).toBe('Acesso não autorizado')
  })
})
