import { describe, beforeEach, expect, it, jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import request from 'supertest'

jest.mock('../src/prisma', () => ({
  prisma: {
    presenca: {
      findMany: jest.fn(),
    },
  },
}))

import { prisma } from '../src/prisma'
import { app } from '../src/server'

const findMany = prisma.presenca.findMany as jest.MockedFunction<
  typeof prisma.presenca.findMany
>

const criarToken = (id: string, role: 'aluno' | 'professor') =>
  jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: '5m' })

describe('GET /alunos/me/presencas', () => {
  beforeEach(() => {
    findMany.mockReset()
  })

  it('exige autenticação', async () => {
    const response = await request(app).get('/alunos/me/presencas')

    expect(response.status).toBe(401)
  })

  it('permite somente tokens de aluno', async () => {
    const response = await request(app)
      .get('/alunos/me/presencas')
      .set('Authorization', `Bearer ${criarToken('professor-1', 'professor')}`)

    expect(response.status).toBe(403)
    expect(findMany).not.toHaveBeenCalled()
  })

  it('impede que aluno use o endpoint antigo que lista todos os históricos', async () => {
    const token = criarToken('aluno-1', 'aluno')

    const [checkin, presencas] = await Promise.all([
      request(app).get('/checkin').set('Authorization', `Bearer ${token}`),
      request(app).get('/presencas').set('Authorization', `Bearer ${token}`),
    ])

    expect(checkin.status).toBe(403)
    expect(presencas.status).toBe(403)
  })

  it('usa exclusivamente o ID do aluno contido no JWT', async () => {
    findMany.mockResolvedValue([])

    await request(app)
      .get('/alunos/me/presencas?periodo=todos&alunoId=outro-aluno')
      .set('Authorization', `Bearer ${criarToken('aluno-autenticado', 'aluno')}`)

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { alunoId: 'aluno-autenticado' },
      }),
    )
  })

  it('isola as consultas de dois alunos diferentes', async () => {
    findMany.mockResolvedValue([])

    await request(app)
      .get('/alunos/me/presencas?periodo=todos')
      .set('Authorization', `Bearer ${criarToken('aluno-a', 'aluno')}`)
    await request(app)
      .get('/alunos/me/presencas?periodo=todos')
      .set('Authorization', `Bearer ${criarToken('aluno-b', 'aluno')}`)

    expect(findMany.mock.calls[0][0].where).toEqual({ alunoId: 'aluno-a' })
    expect(findMany.mock.calls[1][0].where).toEqual({ alunoId: 'aluno-b' })
  })

  it('calcula a frequência considerando justificadas como frequência', async () => {
    findMany.mockResolvedValue([
      { id: '1', data: new Date(), status: 'presente', turmaId: 't1', alunoId: 'a1', editadoPor: null, turma: null } as never,
      { id: '2', data: new Date(), status: 'justificada', turmaId: 't1', alunoId: 'a1', editadoPor: null, turma: null } as never,
      { id: '3', data: new Date(), status: 'falta', turmaId: 't1', alunoId: 'a1', editadoPor: null, turma: null } as never,
    ])

    const response = await request(app)
      .get('/alunos/me/presencas?periodo=todos')
      .set('Authorization', `Bearer ${criarToken('a1', 'aluno')}`)

    expect(response.status).toBe(200)
    expect(response.body.resumo).toEqual({
      total: 3,
      presentes: 1,
      faltas: 1,
      justificadas: 1,
      percentualFrequencia: 67,
    })
  })

  it('rejeita um período não suportado', async () => {
    const response = await request(app)
      .get('/alunos/me/presencas?periodo=365')
      .set('Authorization', `Bearer ${criarToken('a1', 'aluno')}`)

    expect(response.status).toBe(400)
    expect(findMany).not.toHaveBeenCalled()
  })
})
