import { describe, expect, it, jest, beforeEach } from '@jest/globals'
import jwt from 'jsonwebtoken'
import request from 'supertest'

const countPresencas = jest.fn<(query?: unknown) => Promise<number>>()
const countAlunos = jest.fn<(query?: unknown) => Promise<number>>()
const listarAlunos = jest.fn<(query?: unknown) => Promise<unknown[]>>()
const listarTurmas = jest.fn<(query?: unknown) => Promise<unknown[]>>()
const listarFeed = jest.fn<(query?: unknown) => Promise<unknown[]>>()

jest.mock('../src/prisma', () => ({ prisma: {
  presenca: { count: countPresencas, findMany: listarFeed },
  aluno: { count: countAlunos, findMany: listarAlunos },
  turma: { findMany: listarTurmas },
} }))
import { app } from '../src/server'
import { periodoHoje } from '../src/controllers/painelController'
import { presencaEvento } from '../src/presencaEvento'
import type { Presenca } from '@prisma/client'

const token = (role: string) => jwt.sign({ id: 'teste', role }, process.env.JWT_SECRET as string)

beforeEach(() => {
  jest.clearAllMocks()
  countPresencas.mockResolvedValue(0)
  countAlunos.mockResolvedValue(0)
  listarAlunos.mockResolvedValue([])
  listarTurmas.mockResolvedValue([])
  listarFeed.mockResolvedValue([])
})

describe('Resumo do painel', () => {
  it('emite apenas campos persistidos necessários à reconciliação', () => {
    const presenca = { id: 'p1', alunoId: 'a1', turmaId: 't1', data: new Date('2026-10-10T12:00:00Z'), status: 'presente', aluno: { nome: 'Nome Privado', matricula: '123', nfc_uid: 'tag' } } as unknown as Presenca
    expect(presencaEvento(presenca)).toEqual({ id: 'p1', alunoId: 'a1', turmaId: 't1', data: presenca.data, status: 'presente' })
  })

  it('usa o dia de Manaus e exclui a meia-noite seguinte', () => {
    expect(periodoHoje(new Date('2026-10-10T02:00:00Z'))).toEqual({
      inicio: new Date('2026-10-09T04:00:00Z'),
      fim: new Date('2026-10-10T04:00:00Z'),
    })
  })

  it('nega acesso ao aluno', async () => {
    const resposta = await request(app).get('/painel/resumo').set('Authorization', `Bearer ${token('aluno')}`)
    expect(resposta.status).toBe(403)
    expect(countPresencas).not.toHaveBeenCalled()
  })

  it('retorna zeros e listas vazias sem dados de demonstração', async () => {
    const resposta = await request(app).get('/painel/resumo').set('Authorization', `Bearer ${token('professor')}`)
    expect(resposta.status).toBe(200)
    expect(resposta.body).toMatchObject({ checkinsHoje: 0, totalAlunos: 0, totalRisco: 0, feed: [], ranking: [], alunosRisco: [] })
    expect(countPresencas).toHaveBeenCalledWith({ where: { status: 'presente', data: { gte: expect.any(Date), lt: expect.any(Date) } } })
    expect(listarFeed).toHaveBeenCalledWith(expect.objectContaining({ where: { status: 'presente' }, take: 20 }))
  })

  it('aplica a regra de risco existente e minimiza a identificação', async () => {
    countPresencas.mockResolvedValue(7)
    countAlunos.mockResolvedValue(2)
    listarAlunos.mockResolvedValue([
      { id: 'a1', nome: 'Ana Maria', apelido: null, turma: { nome: 'A' }, presencas: [{ status: 'falta' }, { status: 'falta' }, { status: 'falta' }] },
      { id: 'a2', nome: 'Beatriz Silva', apelido: 'Bia', turma: { nome: 'A' }, presencas: [{ status: 'presente' }, { status: 'falta' }, { status: 'falta' }] },
    ])
    listarTurmas.mockResolvedValue([{ id: 't1', nome: 'A', alunos: [{ pontos: 10 }, { pontos: 20 }] }])
    listarFeed.mockResolvedValue([{ id: 'p1', data: new Date(), status: 'presente', alunoId: 'a2', turmaId: 't1', aluno: { nome: 'Beatriz Silva', apelido: 'Bia' }, turma: { nome: 'A' } }])
    const resposta = await request(app).get('/painel/resumo').set('Authorization', `Bearer ${token('professor')}`)
    expect(resposta.body).toMatchObject({ checkinsHoje: 7, totalAlunos: 2, totalRisco: 1, alunosRisco: [{ id: 'a1', identificacao: 'AM' }], ranking: [{ pontos: 30, totalAlunos: 2 }], feed: [{ id: 'p1', identificacao: 'Bia' }] })
    expect(JSON.stringify(resposta.body)).not.toMatch(/Beatriz|Ana Maria|matricula|nfc_uid|senha/)
  })
})
