import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const autenticar = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).json({ erro: 'Token não fornecido' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    ;(req as any).professor = decoded
    next()
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' })
  }
}