import express from 'express';
import { prisma } from '../server';
import { StatusPagamento, TipoGasto } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /gastos - Listar todos os gastos do usuário
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const gastos = await prisma.gasto.findMany({
      where: { usuarioId: req.userId },
      orderBy: { dataVencimento: 'desc' }
    });

    return res.json(gastos);
  } catch (error) {
    console.error('Erro ao buscar gastos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /gastos/:id - Buscar um gasto específico
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (!req.userId || !id) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const gasto = await prisma.gasto.findFirst({
      where: {
        id,
        usuarioId: req.userId
      }
    });

    if (!gasto) {
      return res.status(404).json({ error: 'Gasto não encontrado' });
    }

    return res.json(gasto);
  } catch (error) {
    console.error('Erro ao buscar gasto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /gastos - Criar um novo gasto
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      descricao,
      valor,
      dataVencimento,
      status,
      parcelas,
      tipo
    } = req.body;


    // Validação básica
    if (!descricao || !valor || !dataVencimento || !req.userId || !tipo) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    const statusEnum = Object.values(StatusPagamento).includes(status as StatusPagamento)
      ? (status as StatusPagamento)
      : StatusPagamento.A_PAGAR;

    if (!Object.values(TipoGasto).includes(tipo as TipoGasto)) {
      return res.status(400).json({ error: 'tipo inválido (CARTAO_CREDITO, DEBITO, PIX, BOLETO)' });
    }
    const tipoEnum = tipo as TipoGasto;


    // Criar o gasto principal
    const gasto = await prisma.gasto.create({
      data: {
        descricao,
        valor: Number(valor),
        dataVencimento: new Date(dataVencimento),
        status: statusEnum,
        tipo: tipoEnum,
        usuarioId: req.userId
      }
    });


    // Se tem parcelas, criar parcelas relacionadas
    if (parcelas && parseInt(parcelas) > 1) {
      const numParcelas = Number(parcelas || 1);
      const valorParcela = parseFloat(valor) / numParcelas;
      const dataBase = new Date(dataVencimento);

      const parcelasData = [];

      for (let i = 1; i <= numParcelas; i++) {
        const dataParcelada = new Date(dataBase);
        dataParcelada.setMonth(dataParcelada.getMonth() + (i - 1));

        parcelasData.push({
          descricao: `${descricao} - Parcela ${i}/${numParcelas}`,
          valor: valorParcela,
          dataVencimento: dataParcelada,
          numeroParcela: i,
          totalParcelas: numParcelas,
          status: statusEnum,
          idGastoPrincipal: gasto.id
        });
      }

      await prisma.parcela.createMany({
        data: parcelasData
      });
    }

    return res.status(201).json(gasto);
  } catch (error) {
    console.error('Erro ao criar gasto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PATCH /gastos/:id - Atualizar status do gasto
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.userId || !id) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const gastoExistente = await prisma.gasto.findFirst({
      where: { id, usuarioId: req.userId }
    });

    if (!gastoExistente) {
      return res.status(404).json({ error: 'Gasto não encontrado' });
    }

    if (!Object.values(StatusPagamento).includes(status as StatusPagamento)) {
      return res.status(400).json({ error: 'status inválido' });
    }

    const gastoAtualizado = await prisma.gasto.update({
      where: { id },
      data: { status: status as StatusPagamento }
    });

    return res.json(gastoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar status do gasto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /gastos/:id - Atualizar um gasto completo
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (!req.userId || !id) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Verificar se o gasto existe e pertence ao usuário
    const gastoExistente = await prisma.gasto.findFirst({
      where: {
        id,
        usuarioId: req.userId
      }
    });

    if (!gastoExistente) {
      return res.status(404).json({ error: 'Gasto não encontrado' });
    }

    const { descricao, valor, dataVencimento, tipo, status, parcelas } = req.body;

    const dataUpdate: any = {};
    if (descricao) dataUpdate.descricao = descricao;
    if (valor !== undefined) dataUpdate.valor = Number(valor);
    if (dataVencimento) dataUpdate.dataVencimento = new Date(dataVencimento);
    if (parcelas !== undefined) dataUpdate.parcelas = Number(parcelas);
    if (tipo) {
      if (!Object.values(TipoGasto).includes(tipo as TipoGasto)) {
        return res.status(400).json({ error: 'tipo inválido' });
      }
      dataUpdate.tipo = tipo as TipoGasto;
    }
    if (status) {
      if (!Object.values(StatusPagamento).includes(status as StatusPagamento)) {
        return res.status(400).json({ error: 'status inválido' });
      }
      dataUpdate.status = status as StatusPagamento;
    }

    const gastoAtualizado = await prisma.gasto.update({
      where: { id },
      data: dataUpdate
    });


    return res.json(gastoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar gasto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /gastos/:id - Deletar um gasto
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (!req.userId || !id) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Verificar se o gasto existe e pertence ao usuário
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

    return res.json({ message: 'Gasto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar gasto:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;