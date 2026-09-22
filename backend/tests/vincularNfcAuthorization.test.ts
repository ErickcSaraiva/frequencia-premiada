import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import request from 'supertest'

jest.mock('../src/prisma', () => ({
  prisma: {
    aluno: {
      update: jest.fn(),
    },
  },
}))

import { prisma } from '../src/prisma'
import { app } from '../src/server'

const update = prisma.aluno.update as jest.MockedFunction<
  typeof prisma.aluno.update
>

const criarToken = (role: 'aluno' | 'professor') =>
  jwt.sign(
    {
      id: `usuario-${role}`,
      role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '5m' },
  )

describe('PATCH /alunos/vincular-nfc', () => {
  beforeEach(() => {
    update.mockReset()
  })

  it('exige autenticação', async () => {
    const response = await request(app)
      .patch('/alunos/vincular-nfc')
      .send({
        matricula: 'ALUNO001',
        nfc_uid: 'A1B2C3D4',
      })

    expect(response.status).toBe(401)
    expect(response.body.erro).toBe('Token não fornecido')
    expect(update).not.toHaveBeenCalled()
  })

  it('bloqueia vínculo realizado por aluno', async () => {
    const response = await request(app)
      .patch('/alunos/vincular-nfc')
      .set('Authorization', `Bearer ${criarToken('aluno')}`)
      .send({
        matricula: 'ALUNO001',
        nfc_uid: 'A1B2C3D4',
      })

    expect(response.status).toBe(403)
    expect(response.body.erro).toBe('Acesso não autorizado')
    expect(update).not.toHaveBeenCalled()
  })

  it('permite que professor vincule a tag', async () => {
    update.mockResolvedValue({
      id: 'aluno-1',
      nome: 'Aluno Demo',
      apelido: 'Demo',
      matricula: 'ALUNO001',
      senha: 'hash-nao-exposto',
      nfc_uid: 'A1B2C3D4',
      turmaId: 'turma-1',
      pontos: 0,
      primeiro_acesso: false,
    } as never)

    const response = await request(app)
      .patch('/alunos/vincular-nfc')
      .set('Authorization', `Bearer ${criarToken('professor')}`)
      .send({
        matricula: 'ALUNO001',
        nfc_uid: 'A1B2C3D4',
      })

    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith({
      where: { matricula: 'ALUNO001' },
      data: { nfc_uid: 'A1B2C3D4' },
    })
    expect(response.body.message).toBe('Tag vinculada com sucesso!')
    expect(response.body.aluno).not.toHaveProperty('senha')
  })
})
