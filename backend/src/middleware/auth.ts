
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback-secret') as { userId: string };


    // Verificar se o usuário ainda existe
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.userId = decoded.userId;
    return next();

  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export { AuthRequest };
