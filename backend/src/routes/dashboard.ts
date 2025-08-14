import express from 'express';
import { prisma } from '../server';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { StatusPagamento } from '@prisma/client';

const router = express.Router();

// Auth em todas as rotas
router.use(authenticateToken);

// GET /dashboard/resumo
router.get('/resumo', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Não autenticado' });
    const usuarioId = req.userId as string;

    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);

    const [gastosMes, contasFixasMes, parcelasMes] = await Promise.all([
      prisma.gasto.findMany({
        where: { usuarioId, dataVencimento: { gte: inicioMes, lte: fimMes } }
      }),
      prisma.contaFixa.findMany({
        where: { usuarioId, dataVencimento: { gte: inicioMes, lte: fimMes } }
      }),
      prisma.parcela.findMany({
        where: { gastoPrincipal: { usuarioId }, dataVencimento: { gte: inicioMes, lte: fimMes } }
      })
    ]);

    const soma = (a: number, b: number) => a + b;

    const totalGastos = gastosMes.map(g => g.valor).reduce(soma, 0);
    const totalContasFixas = contasFixasMes.map(c => c.valor).reduce(soma, 0);
    const totalParcelas = parcelasMes.map(p => p.valor).reduce(soma, 0);
    const totalMensal = totalGastos + totalContasFixas + totalParcelas;

    const gastosPagos = gastosMes.filter(g => g.status === StatusPagamento.PAGO);
    const contasFixasPagas = contasFixasMes.filter(c => c.status === StatusPagamento.PAGO);
    const parcelasPagas = parcelasMes.filter(p => p.status === StatusPagamento.PAGO);
    const totalPago = [...gastosPagos, ...contasFixasPagas, ...parcelasPagas]
      .map(i => i.valor).reduce(soma, 0);

    const gastosAtrasados = gastosMes.filter(g => g.status === StatusPagamento.ATRASADO);
    const contasFixasAtrasadas = contasFixasMes.filter(c => c.status === StatusPagamento.ATRASADO);
    const parcelasAtrasadas = parcelasMes.filter(p => p.status === StatusPagamento.ATRASADO);
    const totalAtrasado = [...gastosAtrasados, ...contasFixasAtrasadas, ...parcelasAtrasadas]
      .map(i => i.valor).reduce(soma, 0);

    const totalItensAtrasados =
      gastosAtrasados.length + contasFixasAtrasadas.length + parcelasAtrasadas.length;

    const itensAPagar =
      gastosMes.filter(g => g.status === StatusPagamento.A_PAGAR).length +
      contasFixasMes.filter(c => c.status === StatusPagamento.A_PAGAR).length +
      parcelasMes.filter(p => p.status === StatusPagamento.A_PAGAR).length;

    return res.json({
      totalMensal,
      totalPago,
      totalAtrasado,
      totalItensAtrasados,
      resumoPorTipo: {
        gastos: totalGastos,
        contasFixas: totalContasFixas,
        parcelas: totalParcelas
      },
      itensPorStatus: {
        pagos: gastosPagos.length + contasFixasPagas.length + parcelasPagas.length,
        atrasados: totalItensAtrasados,
        aPagar: itensAPagar
      }
    });
  } catch (error) {
    console.error('Erro ao buscar resumo do dashboard:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /dashboard/atrasados
router.get('/atrasados', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Não autenticado' });
    const usuarioId = req.userId as string;

    const [gastos, contasFixas, parcelas] = await Promise.all([
      prisma.gasto.findMany({
        where: { usuarioId, status: StatusPagamento.ATRASADO }
      }),
      prisma.contaFixa.findMany({
        where: { usuarioId, status: StatusPagamento.ATRASADO }
      }),
      prisma.parcela.findMany({
        where: { status: StatusPagamento.ATRASADO, gastoPrincipal: { usuarioId } },
        include: { gastoPrincipal: true }
      })
    ]);

    return res.json({ gastos, contasFixas, parcelas });
  } catch (error) {
    console.error('Erro ao buscar itens atrasados:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /dashboard/atualizar-status-lote
router.put('/atualizar-status-lote', async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Não autenticado' });

    const { tipo, ids, novoStatus } = req.body;
    if (!tipo || !Array.isArray(ids) || ids.length === 0 || !novoStatus) {
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }

    if (!Object.values(StatusPagamento).includes(novoStatus as StatusPagamento)) {
      return res.status(400).json({ error: 'status inválido' });
    }
    const statusEnum = novoStatus as StatusPagamento;
    const usuarioId = req.userId as string;

    let resultado;
    if (tipo === 'gastos') {
      resultado = await prisma.gasto.updateMany({
        where: { id: { in: ids as string[] }, usuarioId },
        data: { status: statusEnum }
      });
    } else if (tipo === 'contasFixas') {
      resultado = await prisma.contaFixa.updateMany({
        where: { id: { in: ids as string[] }, usuarioId },
        data: { status: statusEnum }
      });
    } else if (tipo === 'parcelas') {
      resultado = await prisma.parcela.updateMany({
        where: { id: { in: ids as string[] }, gastoPrincipal: { usuarioId } },
        data: { status: statusEnum }
      });
    } else {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    return res.json({
      message: `${resultado.count} item(s) atualizado(s) com sucesso`,
      count: resultado.count
    });
  } catch (error) {
    console.error('Erro ao atualizar status em lote:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
