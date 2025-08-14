
import express from 'express';
import { prisma } from '../server';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET - Listar todas as parcelas do usuário
router.get('/', async (req: AuthRequest, res) => {
  try {
    const parcelas = await prisma.parcela.findMany({
      where: { 
        gastoPrincipal: {
          usuarioId: req.userId
        }
      },
      include: {
        gastoPrincipal: true
      },
      orderBy: { dataVencimento: 'asc' }
    });

    res.json(parcelas);
  } catch (error) {
    console.error('Erro ao buscar parcelas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar parcela por ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const parcela = await prisma.parcela.findFirst({
      where: { 
        id,
        gastoPrincipal: {
          usuarioId: req.userId
        }
      },
      include: {
        gastoPrincipal: true
      }
    });

    if (!parcela) {
      return res.status(404).json({ error: 'Parcela não encontrada' });
    }

    res.json(parcela);
  } catch (error) {
    console.error('Erro ao buscar parcela:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar parcela (principalmente status)
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, dataVencimento } = req.body;

    const parcelaExistente = await prisma.parcela.findFirst({
      where: { 
        id,
        gastoPrincipal: {
          usuarioId: req.userId
        }
      }
    });

    if (!parcelaExistente) {
      return res.status(404).json({ error: 'Parcela não encontrada' });
    }

    const parcela = await prisma.parcela.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(dataVencimento && { dataVencimento: new Date(dataVencimento) })
      },
      include: {
        gastoPrincipal: true
      }
    });

    res.json(parcela);
  } catch (error) {
    console.error('Erro ao atualizar parcela:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar parcelas atrasadas
router.get('/atrasadas/list', async (req: AuthRequest, res) => {
  try {
    const parcelas = await prisma.parcela.findMany({
      where: { 
        status: 'ATRASADO',
        gastoPrincipal: {
          usuarioId: req.userId
        }
      },
      include: {
        gastoPrincipal: true
      },
      orderBy: { dataVencimento: 'asc' }
    });

    res.json(parcelas);
  } catch (error) {
    console.error('Erro ao buscar parcelas atrasadas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
