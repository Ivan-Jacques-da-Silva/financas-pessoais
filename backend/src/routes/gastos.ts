
import express from 'express';
import { prisma } from '../server';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET - Listar todos os gastos do usuário
router.get('/', async (req: AuthRequest, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      where: { usuarioId: req.userId },
      include: {
        parcelasGasto: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(gastos);
  } catch (error) {
    console.error('Erro ao buscar gastos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar gasto por ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const gasto = await prisma.gasto.findFirst({
      where: { 
        id,
        usuarioId: req.userId 
      },
      include: {
        parcelasGasto: true
      }
    });

    if (!gasto) {
      return res.status(404).json({ error: 'Gasto não encontrado' });
    }

    res.json(gasto);
  } catch (error) {
    console.error('Erro ao buscar gasto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Criar novo gasto
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { descricao, valor, dataVencimento, tipo, parcelas = 1 } = req.body;

    if (!descricao || !valor || !dataVencimento || !tipo) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Determinar status baseado na data de vencimento
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    let status = 'A_PAGAR';
    
    if (vencimento < hoje) {
      status = 'ATRASADO';
    }

    const gasto = await prisma.gasto.create({
      data: {
        descricao,
        valor: parseFloat(valor),
        dataVencimento: new Date(dataVencimento),
        tipo,
        parcelas: parseInt(parcelas),
        status,
        usuarioId: req.userId!
      }
    });

    // Se for parcelado, criar as parcelas
    if (parcelas > 1) {
      const parcelasData = [];
      const valorParcela = parseFloat(valor) / parseInt(parcelas);
      
      for (let i = 1; i <= parseInt(parcelas); i++) {
        const dataVencimentoParcela = new Date(dataVencimento);
        dataVencimentoParcela.setMonth(dataVencimentoParcela.getMonth() + (i - 1));
        
        let statusParcela = 'A_PAGAR';
        if (dataVencimentoParcela < hoje) {
          statusParcela = 'ATRASADO';
        }

        parcelasData.push({
          descricao: `${descricao} - Parcela ${i}`,
          valor: valorParcela,
          dataVencimento: dataVencimentoParcela,
          numeroParcela: i,
          totalParcelas: parseInt(parcelas),
          status: statusParcela,
          idGastoPrincipal: gasto.id
        });
      }

      await prisma.parcela.createMany({
        data: parcelasData
      });
    }

    const gastoCompleto = await prisma.gasto.findUnique({
      where: { id: gasto.id },
      include: {
        parcelasGasto: true
      }
    });

    res.status(201).json(gastoCompleto);
  } catch (error) {
    console.error('Erro ao criar gasto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar gasto
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, dataVencimento, tipo, status } = req.body;

    const gastoExistente = await prisma.gasto.findFirst({
      where: { 
        id,
        usuarioId: req.userId 
      }
    });

    if (!gastoExistente) {
      return res.status(404).json({ error: 'Gasto não encontrado' });
    }

    const gasto = await prisma.gasto.update({
      where: { id },
      data: {
        ...(descricao && { descricao }),
        ...(valor && { valor: parseFloat(valor) }),
        ...(dataVencimento && { dataVencimento: new Date(dataVencimento) }),
        ...(tipo && { tipo }),
        ...(status && { status })
      },
      include: {
        parcelasGasto: true
      }
    });

    res.json(gasto);
  } catch (error) {
    console.error('Erro ao atualizar gasto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE - Deletar gasto
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const gastoExistente = await prisma.gasto.findFirst({
      where: { 
        id,
        usuarioId: req.userId 
      }
    });

    if (!gastoExistente) {
      return res.status(404).json({ error: 'Gasto não encontrado' });
    }

    await prisma.gasto.delete({
      where: { id }
    });

    res.json({ message: 'Gasto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar gasto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
