export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

export interface Gasto {
  id: string
  descricao: string
  valor: number
  dataVencimento: string
  tipo: TipoGasto
  parcelas: number
  parcelaAtual?: number
  data: string
  status: StatusPagamento
  usuarioId: string
  createdAt: string
  updatedAt: string
}

export interface ContaFixa {
  id: string
  nome: string
  valor: number
  status: StatusPagamento
  dataVencimento: string
  usuarioId: string
  createdAt: string
  updatedAt: string
}

export interface Parcela {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: Date | string;
  numeroParcela: number;
  totalParcelas: number;
  status: StatusPagamento;
  idGastoPrincipal: string;
}

export enum StatusPagamento {
  A_PAGAR = 'A_PAGAR',
  PAGO = 'PAGO',
  ATRASADO = 'ATRASADO'
}

export type StatusPagamento = 'A_PAGAR' | 'PAGO' | 'ATRASADO';

export enum TipoGasto {
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  DEBITO = 'DEBITO',
  PIX = 'PIX',
  BOLETO = 'BOLETO'
}