import type React from "react"

export type TipoGasto = "Cartão de Crédito" | "Débito" | "Pix" | "Boleto"
export type StatusPagamento = "Pago" | "Atrasado" | "A Pagar"

export interface Gasto {
  id: string
  descricao: string
  valor: number
  dataVencimento: string
  tipo: TipoGasto
  parcelas: number
  parcelaAtual?: number
  data?: string // Data de criação para gráficos de evolução
  status: StatusPagamento
}

export interface ContaFixa {
  id: string
  nome: string
  valor: number
  status: StatusPagamento
  dataVencimento: string // Adicionado para controlar o vencimento mensal
}

export interface SummaryData {
  title: string
  value: number
  description: string
  icon: React.ReactNode
}

export interface AppState {
  gastos: Gasto[]
  contasFixas: ContaFixa[]
  hideValues: boolean
}
