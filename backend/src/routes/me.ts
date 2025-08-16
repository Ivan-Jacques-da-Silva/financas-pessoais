import express from 'express';
import { prisma } from '../server';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Usar o middleware padrão que já existe
router.use(authenticateToken);

// Rota para obter dados do usuário atual
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.userId },
      select: { id: true, nome: true, email: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;