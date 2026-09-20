import { Request, Response } from 'express'
import { prisma } from '../prisma'

export const FUSO_HORARIO_PROJETO = 'America/Manaus'

type StatusPresenca = 'presente' | 'falta' | 'justificada'

type ItemResumo = {
  status: string
}

export const calcularResumoFrequencia = (presencas: ItemResumo[]) => {
  const total = presencas.length
  const presentes = presencas.filter((item) => item.status === 'presente').length
  const faltas = presencas.filter((item) => item.status === 'falta').length
  const justificadas = presencas.filter((item) => item.status === 'justificada').length

  // Regra oficial: falta justificada conta como frequência, mas permanece
  // discriminada no resumo para não esconder a situação original.
  const percentualFrequencia = total
    ? Math.round(((presentes + justificadas) / total) * 100)
    : 0

  return { total, presentes, faltas, justificadas, percentualFrequencia }
}

const PERIODOS_PERMITIDOS = new Set(['7', '30', '90', 'todos'])

const inicioDoPeriodo = (periodo: string, agora: Date) => {
  if (periodo === 'todos') return undefined

  const dataLocal = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_HORARIO_PROJETO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(agora)

  const [ano, mes, dia] = dataLocal.split('-').map(Number)
  const inicioLocal = new Date(Date.UTC(ano, mes - 1, dia))
  inicioLocal.setUTCDate(inicioLocal.getUTCDate() - (Number(periodo) - 1))

  const anoInicio = inicioLocal.getUTCFullYear()
  const mesInicio = String(inicioLocal.getUTCMonth() + 1).padStart(2, '0')
  const diaInicio = String(inicioLocal.getUTCDate()).padStart(2, '0')

  // Manaus usa UTC-04:00 durante todo o ano e não adota horário de verão.
  return new Date(`${anoInicio}-${mesInicio}-${diaInicio}T00:00:00-04:00`)
}

export const listarMeuHistorico = async (req: Request, res: Response) => {
  const alunoId = req.user?.id
  const periodo = String(req.query.periodo ?? '30')

  if (!alunoId || req.user?.role !== 'aluno') {
    return res.status(403).json({ erro: 'Acesso permitido somente ao aluno autenticado' })
  }

  if (!PERIODOS_PERMITIDOS.has(periodo)) {
    return res.status(400).json({ erro: 'Período inválido. Use: 7, 30, 90 ou todos' })
  }

  const agora = new Date()
  const inicio = inicioDoPeriodo(periodo, agora)

  try {
    const presencas = await prisma.presenca.findMany({
      where: {
        alunoId,
        ...(inicio ? { data: { gte: inicio, lte: agora } } : {}),
      },
      select: {
        id: true,
        data: true,
        status: true,
        turma: {
          select: {
            id: true,
            nome: true,
            disciplina: {
              select: { id: true, nome: true },
            },
          },
        },
      },
      orderBy: { data: 'desc' },
    })

    const statusValidos = new Set<StatusPresenca>([
      'presente',
      'falta',
      'justificada',
    ])
    const historico = presencas.filter((item) =>
      statusValidos.has(item.status as StatusPresenca),
    )

    return res.json({
      periodo: {
        valor: periodo,
        inicio: inicio?.toISOString() ?? null,
        fim: agora.toISOString(),
        fusoHorario: FUSO_HORARIO_PROJETO,
      },
      resumo: calcularResumoFrequencia(historico),
      presencas: historico,
    })
  } catch (error) {
    console.error('Erro ao buscar histórico do aluno:', error)
    return res.status(500).json({ erro: 'Não foi possível carregar seu histórico' })
  }
}
