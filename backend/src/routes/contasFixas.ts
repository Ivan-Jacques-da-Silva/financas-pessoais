
import express from 'express';
import { prisma } from '../server';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET - Listar todas as contas fixas do usuário
router.get('/', async (req: AuthRequest, res) => {
  try {
    const contasFixas = await prisma.contaFixa.findMany({
      where: { usuarioId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(contasFixas);
  } catch (error) {
    console.error('Erro ao buscar contas fixas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar conta fixa por ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const contaFixa = await prisma.contaFixa.findFirst({
      where: { 
        id,
        usuarioId: req.userId 
      }
    });

    if (!contaFixa) {
      return res.status(404).json({ error: 'Conta fixa não encontrada' });
    }

    res.json(contaFixa);
  } catch (error) {
    console.error('Erro ao buscar conta fixa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Criar nova conta fixa
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { nome, valor, dataVencimento } = req.body;

    if (!nome || !valor || !dataVencimento) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Determinar status baseado na data de vencimento
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    let status = 'A_PAGAR';
    
    if (vencimento < hoje) {
      status = 'ATRASADO';
    }

    const contaFixa = await prisma.contaFixa.create({
      data: {
        nome,
        valor: parseFloat(valor),
        dataVencimento: new Date(dataVencimento),
        status,
        usuarioId: req.userId!
      }
    });

    res.status(201).json(contaFixa);
  } catch (error) {
    console.error('Erro ao criar conta fixa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar conta fixa
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { nome, valor, dataVencimento, status } = req.body;

    const contaFixaExistente = await prisma.contaFixa.findFirst({
      where: { 
        id,
        usuarioId: req.userId 
      }
    });

    if (!contaFixaExistente) {
      return res.status(404).json({ error: 'Conta fixa não encontrada' });
    }

    const contaFixa = await prisma.contaFixa.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(valor && { valor: parseFloat(valor) }),
        ...(dataVencimento && { dataVencimento: new Date(dataVencimento) }),
        ...(status && { status })
      }
    });

    res.json(contaFixa);
  } catch (error) {
    console.error('Erro ao atualizar conta fixa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE - Deletar conta fixa
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const contaFixaExistente = await prisma.contaFixa.findFirst({
      where: { 
        id,
        usuarioId: req.userId 
      }
    });

    if (!contaFixaExistente) {
      return res.status(404).json({ error: 'Conta fixa não encontrada' });
    }

    await prisma.contaFixa.delete({
      where: { id }
    });

    res.json({ message: 'Conta fixa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conta fixa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
