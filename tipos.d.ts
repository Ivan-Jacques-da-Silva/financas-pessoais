import type React from "react"

export type TipoGasto = "Cartão de Crédito" | "Débito" | "Pix" | "Boleto"
export type StatusPagamento = "Pago" | "Atrasado" | "A Pagar"

export interface Parcela {
  id: string
  idGastoPrincipal: string
  descricao: string
  valor: number
  dataVencimento: string
  numeroParcela: number
  totalParcelas: number
  status: StatusPagamento
}

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

export interface DadosSumario {
  titulo: string
  valor: number
  descricao: string
  icone: React.ReactNode
}

export interface EstadoApp {
  gastos: Gasto[]
  contasFixas: ContaFixa[]
  ocultarValores: boolean
  parcelas: Parcela[]
  senhaDefinida: boolean
  hashSenha?: string
}

export interface ConfiguracaoSenha {
  senhaDefinida: boolean
  hashSenha: string
}
