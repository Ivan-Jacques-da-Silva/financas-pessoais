import express from 'express';
import { prisma } from '../server';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import type { Response } from 'express';
import { StatusPagamento } from '@prisma/client';

const router = express.Router();

// Auth em todas as rotas
router.use(authenticateToken);

// GET - Listar todas as parcelas do usuário
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const parcelas = await prisma.parcela.findMany({
      where: { gastoPrincipal: { usuarioId: req.userId as string } },
      include: { gastoPrincipal: true },
      orderBy: { dataVencimento: 'asc' }
    });

    return res.json(parcelas);
  } catch (error) {
    console.error('Erro ao buscar parcelas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar parcelas atrasadas
router.get('/atrasadas/list', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const parcelas = await prisma.parcela.findMany({
      where: {
        status: StatusPagamento.ATRASADO,
        gastoPrincipal: { usuarioId: req.userId as string }
      },
      include: { gastoPrincipal: true },
      orderBy: { dataVencimento: 'asc' }
    });

    return res.json(parcelas);
  } catch (error) {
    console.error('Erro ao buscar parcelas atrasadas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar parcela por ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

    const parcela = await prisma.parcela.findFirst({
      where: { id, gastoPrincipal: { usuarioId: req.userId as string } },
      include: { gastoPrincipal: true }
    });

    if (!parcela) return res.status(404).json({ error: 'Parcela não encontrada' });
    return res.json(parcela);
  } catch (error) {
    console.error('Erro ao buscar parcela:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PATCH - Atualizar status da parcela
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

    const existe = await prisma.parcela.findFirst({
      where: { id, gastoPrincipal: { usuarioId: req.userId as string } }
    });
    if (!existe) return res.status(404).json({ error: 'Parcela não encontrada' });

    if (!Object.values(StatusPagamento).includes(status as StatusPagamento)) {
      return res.status(400).json({ error: 'status inválido' });
    }

    const parcela = await prisma.parcela.update({
      where: { id },
      data: { status: status as StatusPagamento },
      include: { gastoPrincipal: true }
    });

    return res.json(parcela);
  } catch (error) {
    console.error('Erro ao atualizar status da parcela:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar parcela completa
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

    const existe = await prisma.parcela.findFirst({
      where: { id, gastoPrincipal: { usuarioId: req.userId as string } }
    });
    if (!existe) return res.status(404).json({ error: 'Parcela não encontrada' });

    const { status, dataVencimento } = req.body;

    const dados: any = {};
    if (dataVencimento) dados.dataVencimento = new Date(dataVencimento);
    if (status !== undefined) {
      if (!Object.values(StatusPagamento).includes(status as StatusPagamento)) {
        return res.status(400).json({ error: 'status inválido' });
      }
      dados.status = status as StatusPagamento;
    }

    const parcela = await prisma.parcela.update({
      where: { id },
      data: dados,
      include: { gastoPrincipal: true }
    });

    return res.json(parcela);
  } catch (error) {
    console.error('Erro ao atualizar parcela:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
