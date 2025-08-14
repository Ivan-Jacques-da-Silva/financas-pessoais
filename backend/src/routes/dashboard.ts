
import express from 'express';
import { prisma } from '../server';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET - Resumo do dashboard
router.get('/resumo', async (req: AuthRequest, res) => {
  try {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    // Gastos do mês
    const gastosMes = await prisma.gasto.findMany({
      where: {
        usuarioId: req.userId,
        dataVencimento: {
          gte: inicioMes,
          lte: fimMes
        }
      }
    });

    // Contas fixas do mês
    const contasFixasMes = await prisma.contaFixa.findMany({
      where: {
        usuarioId: req.userId,
        dataVencimento: {
          gte: inicioMes,
          lte: fimMes
        }
      }
    });

    // Parcelas do mês
    const parcelasMes = await prisma.parcela.findMany({
      where: {
        gastoPrincipal: {
          usuarioId: req.userId
        },
        dataVencimento: {
          gte: inicioMes,
          lte: fimMes
        }
      }
    });

    // Cálculos
    const totalGastos = gastosMes.reduce((sum, gasto) => sum + gasto.valor, 0);
    const totalContasFixas = contasFixasMes.reduce((sum, conta) => sum + conta.valor, 0);
    const totalParcelas = parcelasMes.reduce((sum, parcela) => sum + parcela.valor, 0);

    const totalMensal = totalGastos + totalContasFixas + totalParcelas;

    // Itens pagos
    const gastosPagos = gastosMes.filter(g => g.status === 'PAGO');
    const contasFixasPagas = contasFixasMes.filter(c => c.status === 'PAGO');
    const parcelasPagas = parcelasMes.filter(p => p.status === 'PAGO');

    const totalPago = [
      ...gastosPagos,
      ...contasFixasPagas,
      ...parcelasPagas
    ].reduce((sum, item) => sum + item.valor, 0);

    // Itens atrasados
    const gastosAtrasados = gastosMes.filter(g => g.status === 'ATRASADO');
    const contasFixasAtrasadas = contasFixasMes.filter(c => c.status === 'ATRASADO');
    const parcelasAtrasadas = parcelasMes.filter(p => p.status === 'ATRASADO');

    const totalAtrasado = [
      ...gastosAtrasados,
      ...contasFixasAtrasadas,
      ...parcelasAtrasadas
    ].reduce((sum, item) => sum + item.valor, 0);

    const totalItensAtrasados = gastosAtrasados.length + contasFixasAtrasadas.length + parcelasAtrasadas.length;

    res.json({
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
        aPagar: (gastosMes.length + contasFixasMes.length + parcelasMes.length) - 
                (gastosPagos.length + contasFixasPagas.length + parcelasPagas.length) - 
                totalItensAtrasados
      }
    });
  } catch (error) {
    console.error('Erro ao buscar resumo do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Todos os itens atrasados
router.get('/atrasados', async (req: AuthRequest, res) => {
  try {
    const gastosAtrasados = await prisma.gasto.findMany({
      where: {
        usuarioId: req.userId,
        status: 'ATRASADO'
      }
    });

    const contasFixasAtrasadas = await prisma.contaFixa.findMany({
      where: {
        usuarioId: req.userId,
        status: 'ATRASADO'
      }
    });

    const parcelasAtrasadas = await prisma.parcela.findMany({
      where: {
        status: 'ATRASADO',
        gastoPrincipal: {
          usuarioId: req.userId
        }
      },
      include: {
        gastoPrincipal: true
      }
    });

    res.json({
      gastos: gastosAtrasados,
      contasFixas: contasFixasAtrasadas,
      parcelas: parcelasAtrasadas
    });
  } catch (error) {
    console.error('Erro ao buscar itens atrasados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar status em lote
router.put('/atualizar-status-lote', async (req: AuthRequest, res) => {
  try {
    const { tipo, ids, novoStatus } = req.body;

    if (!tipo || !ids || !Array.isArray(ids) || !novoStatus) {
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }

    let resultado;

    switch (tipo) {
      case 'gastos':
        resultado = await prisma.gasto.updateMany({
          where: {
            id: { in: ids },
            usuarioId: req.userId
          },
          data: { status: novoStatus }
        });
        break;
      
      case 'contasFixas':
        resultado = await prisma.contaFixa.updateMany({
          where: {
            id: { in: ids },
            usuarioId: req.userId
          },
          data: { status: novoStatus }
        });
        break;
      
      case 'parcelas':
        resultado = await prisma.parcela.updateMany({
          where: {
            id: { in: ids },
            gastoPrincipal: {
              usuarioId: req.userId
            }
          },
          data: { status: novoStatus }
        });
        break;
      
      default:
        return res.status(400).json({ error: 'Tipo inválido' });
    }

    res.json({ 
      message: `${resultado.count} item(s) atualizado(s) com sucesso`,
      count: resultado.count
    });
  } catch (error) {
    console.error('Erro ao atualizar status em lote:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
