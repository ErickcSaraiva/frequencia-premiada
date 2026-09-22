import { describe, expect, it, jest } from '@jest/globals'
import request from 'supertest'

jest.mock('../src/prisma', () => ({
  prisma: {
    aluno: {
      findUnique: jest.fn(() => Promise.resolve(null)),
    },
  },
}))

import { app } from '../src/server'

describe('POST /alunos/login', () => {
  it('mantém o login do aluno público e registrado', async () => {
    const response = await request(app)
      .post('/alunos/login')
      .send({
        matricula: 'ALUNO_INEXISTENTE',
        senha: '123456',
      })

    expect(response.status).toBe(404)
    expect(response.body.erro).toBe('Aluno não encontrado')
  })
})
