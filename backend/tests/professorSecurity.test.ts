import { describe, expect, it } from '@jest/globals'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { app } from '../src/server'

const criarToken = (role: 'aluno' | 'professor') =>
  jwt.sign(
    {
      id: 'usuario-de-teste',
      role,
      email: 'teste@edupoints.com',
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '5m' }
  )

describe('Segurança do cadastro de professores', () => {
  it('remove a antiga rota pública /auth/cadastrar', async () => {
    const response = await request(app)
      .post('/auth/cadastrar')
      .send({
        nome: 'Teste',
        email: 'teste@edupoints.com',
        senha: 'senha-segura-123',
      })

    expect(response.status).toBe(404)
  })

  it('bloqueia cadastro sem token', async () => {
    const response = await request(app)
      .post('/professores')
      .send({
        nome: 'Teste',
        email: 'teste@edupoints.com',
        senha: 'senha-segura-123',
      })

    expect(response.status).toBe(401)
    expect(response.body.erro).toBe('Token não fornecido')
  })

  it('bloqueia cadastro realizado por aluno', async () => {
    const response = await request(app)
      .post('/professores')
      .set('Authorization', `Bearer ${criarToken('aluno')}`)
      .send({
        nome: 'Teste',
        email: 'teste@edupoints.com',
        senha: 'senha-segura-123',
      })

    expect(response.status).toBe(403)
    expect(response.body.erro).toBe('Acesso não autorizado')
  })

  it('rejeita senha vazia antes de consultar o banco', async () => {
    const response = await request(app)
      .post('/professores')
      .set('Authorization', `Bearer ${criarToken('professor')}`)
      .send({
        nome: 'Teste',
        email: 'teste@edupoints.com',
        senha: '',
      })

    expect(response.status).toBe(400)
    expect(response.body.erro).toBe(
      'Nome, e-mail e senha são obrigatórios'
    )
  })

  it('rejeita senha com menos de 12 caracteres', async () => {
    const response = await request(app)
      .post('/professores')
      .set('Authorization', `Bearer ${criarToken('professor')}`)
      .send({
        nome: 'Teste',
        email: 'teste@edupoints.com',
        senha: '123456',
      })

    expect(response.status).toBe(400)
    expect(response.body.erro).toBe(
      'A senha deve ter pelo menos 12 caracteres'
    )
  })

  it('rejeita e-mail inválido', async () => {
    const response = await request(app)
      .post('/professores')
      .set('Authorization', `Bearer ${criarToken('professor')}`)
      .send({
        nome: 'Teste',
        email: 'email-invalido',
        senha: 'senha-segura-123',
      })

    expect(response.status).toBe(400)
    expect(response.body.erro).toBe('Informe um e-mail válido')
  })
})
