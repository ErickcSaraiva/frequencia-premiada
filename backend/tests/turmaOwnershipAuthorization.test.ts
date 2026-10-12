import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import request from 'supertest'

const buscarTurma = jest.fn<
  (query?: unknown) => Promise<{ id: string } | null>
>()
const listarAlunos = jest.fn<
  (query?: unknown) => Promise<unknown[]>
>()

jest.mock('../src/prisma', () => ({
  prisma: {
    turma: { findFirst: buscarTurma },
    aluno: { findMany: listarAlunos },
  },
}))

import { app } from '../src/server'

const criarToken = (role: 'professor' | 'admin', id: string) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: '5m',
  })

beforeEach(() => {
  jest.clearAllMocks()
  buscarTurma.mockResolvedValue({ id: 'turma-ads' })
  listarAlunos.mockResolvedValue([{ id: 'aluno-1', nome: 'Aluno Teste' }])
})

describe('Acesso de equipe aos alunos por turma', () => {
  it('permite ao professor consultar sua turma', async () => {
    const resposta = await request(app)
      .get('/alunos/turma/turma-ads')
      .set('Authorization', `Bearer ${criarToken('professor', 'professor-1')}`)

    expect(resposta.status).toBe(200)
    expect(buscarTurma).toHaveBeenCalledWith({
      where: { id: 'turma-ads', professorId: 'professor-1' },
      select: { id: true },
    })
    expect(listarAlunos).toHaveBeenCalled()
  })

  it('bloqueia o professor ao consultar turma de outro professor', async () => {
    buscarTurma.mockResolvedValue(null)

    const resposta = await request(app)
      .get('/alunos/turma/turma-ads')
      .set('Authorization', `Bearer ${criarToken('professor', 'professor-2')}`)

    expect(resposta.status).toBe(404)
    expect(resposta.body.erro).toBe(
      'Turma não encontrada ou indisponível para seu acesso',
    )
    expect(listarAlunos).not.toHaveBeenCalled()
  })

  it('permite ao administrador consultar a turma', async () => {
    const resposta = await request(app)
      .get('/alunos/turma/turma-ads')
      .set('Authorization', `Bearer ${criarToken('admin', 'admin-1')}`)

    expect(resposta.status).toBe(200)
    expect(buscarTurma).toHaveBeenCalledWith({
      where: { id: 'turma-ads' },
      select: { id: true },
    })
  })
})
