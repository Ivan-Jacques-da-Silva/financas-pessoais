import express from 'express';
import { prisma } from '../server';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { StatusPagamento } from '@prisma/client';

const router = express.Router();

// Middleware de auth
router.use(authenticateToken);

// GET - Listar contas fixas do usuário
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });
    const usuarioId = req.userId as string;

    const contasFixas = await prisma.contaFixa.findMany({
      where: { usuarioId },
      orderBy: { dataVencimento: 'desc' }
    });

    return res.json(contasFixas);
  } catch (error) {
    console.error('Erro ao buscar contas fixas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar conta fixa por ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

    const contaFixa = await prisma.contaFixa.findFirst({
      where: { id, usuarioId: req.userId as string }
    });

    if (!contaFixa) return res.status(404).json({ error: 'Conta fixa não encontrada' });
    return res.json(contaFixa);
  } catch (error) {
    console.error('Erro ao buscar conta fixa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Criar nova conta fixa
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const { nome, valor, dataVencimento, status } = req.body;
    if (!nome || valor == null || !dataVencimento) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const hoje = new Date();
    const vencimento = new Date(dataVencimento);

    // status do corpo (se válido) senão padrão A_PAGAR
    let statusEnum: StatusPagamento =
      Object.values(StatusPagamento).includes(status as StatusPagamento)
        ? (status as StatusPagamento)
        : StatusPagamento.A_PAGAR;

    // se já venceu e ainda não está pago, marca ATRASADO
    if (vencimento < hoje && statusEnum === StatusPagamento.A_PAGAR) {
      statusEnum = StatusPagamento.ATRASADO;
    }

    const contaFixa = await prisma.contaFixa.create({
      data: {
        nome,
        valor: Number(valor),
        dataVencimento: vencimento,
        status: statusEnum,
        usuarioId: req.userId as string
      }
    });

    return res.status(201).json(contaFixa);
  } catch (error) {
    console.error('Erro ao criar conta fixa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PATCH - Atualizar status da conta fixa
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

    const existe = await prisma.contaFixa.findFirst({
      where: { id, usuarioId: req.userId as string }
    });
    if (!existe) return res.status(404).json({ error: 'Conta fixa não encontrada' });

    if (!Object.values(StatusPagamento).includes(status as StatusPagamento)) {
      return res.status(400).json({ error: 'status inválido' });
    }

    const contaFixa = await prisma.contaFixa.update({
      where: { id },
      data: { status: status as StatusPagamento }
    });

    return res.json(contaFixa);
  } catch (error) {
    console.error('Erro ao atualizar status da conta fixa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar conta fixa completa
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

    const existe = await prisma.contaFixa.findFirst({
      where: { id, usuarioId: req.userId as string }
    });
    if (!existe) return res.status(404).json({ error: 'Conta fixa não encontrada' });

    const { nome, valor, dataVencimento, status } = req.body;

    const dados: any = {};
    if (nome !== undefined) dados.nome = nome;
    if (valor !== undefined) dados.valor = Number(valor);
    if (dataVencimento) dados.dataVencimento = new Date(dataVencimento);
    if (status) {
      if (!Object.values(StatusPagamento).includes(status as StatusPagamento)) {
        return res.status(400).json({ error: 'status inválido' });
      }
      dados.status = status as StatusPagamento;
    }

    const contaFixa = await prisma.contaFixa.update({
      where: { id },
      data: dados
    });

    return res.json(contaFixa);
  } catch (error) {
    console.error('Erro ao atualizar conta fixa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE - Deletar conta fixa
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

    const existe = await prisma.contaFixa.findFirst({
      where: { id, usuarioId: req.userId as string }
    });
    if (!existe) return res.status(404).json({ error: 'Conta fixa não encontrada' });

    await prisma.contaFixa.delete({ where: { id } });
    return res.json({ message: 'Conta fixa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conta fixa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
