import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Gasto, ContaFixa, StatusPagamento, Parcela, EstadoApp, ConfiguracaoSenha } from "@/tipos"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

export function obterStatusPagamento(dataVencimento: string): StatusPagamento {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const dataVenc = new Date(dataVencimento)
  dataVenc.setHours(0, 0, 0, 0)

  if (dataVenc < hoje) {
    return "Atrasado"
  } else {
    return "A Pagar"
  }
}

export function obterCorStatus(status: StatusPagamento): string {
  switch (status) {
    case "Pago":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Atrasado":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "A Pagar":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
  }
}

export function salvarEstadoApp(estado: EstadoApp) {
  localStorage.setItem("estadoApp", JSON.stringify(estado))
}

export function carregarEstadoApp(): EstadoApp | null {
  const estadoSalvo = localStorage.getItem("estadoApp")
  if (estadoSalvo) {
    return JSON.parse(estadoSalvo)
  }
  return null
}

export function atualizarStatusGastos(gastos: Gasto[]): Gasto[] {
  return gastos.map((gasto) => {
    // Se já estiver pago, mantém o status
    if (gasto.status === "Pago") return gasto

    // Caso contrário, atualiza o status baseado na data
    return {
      ...gasto,
      status: obterStatusPagamento(gasto.dataVencimento),
    }
  })
}

export function atualizarStatusContasFixas(contasFixas: ContaFixa[]): ContaFixa[] {
  return contasFixas.map((conta) => {
    // Se já estiver pago, mantém o status
    if (conta.status === "Pago") return conta

    // Caso contrário, atualiza o status baseado na data
    return {
      ...conta,
      status: obterStatusPagamento(conta.dataVencimento),
    }
  })
}

export function atualizarStatusParcelas(parcelas: Parcela[]): Parcela[] {
  return parcelas.map((parcela) => {
    // Se já estiver pago, mantém o status
    if (parcela.status === "Pago") return parcela

    // Caso contrário, atualiza o status baseado na data
    return {
      ...parcela,
      status: obterStatusPagamento(parcela.dataVencimento),
    }
  })
}

export function gerarParcelas(gasto: Gasto): Parcela[] {
  if (gasto.parcelas <= 1) {
    return []
  }

  const parcelas: Parcela[] = []
  const dataBase = new Date(gasto.dataVencimento)
  const valorParcela = gasto.valor / gasto.parcelas

  for (let i = 0; i < gasto.parcelas; i++) {
    const dataVencimento = new Date(dataBase)
    dataVencimento.setMonth(dataBase.getMonth() + i)

    parcelas.push({
      id: crypto.randomUUID(),
      idGastoPrincipal: gasto.id,
      descricao: gasto.descricao,
      valor: valorParcela,
      dataVencimento: dataVencimento.toISOString().split("T")[0],
      numeroParcela: i + 1,
      totalParcelas: gasto.parcelas,
      status: obterStatusPagamento(dataVencimento.toISOString().split("T")[0]),
    })
  }

  return parcelas
}

export function calcularTotalPorTipo(parcelas: Parcela[], gastos: Gasto[]): Record<string, number> {
  const gastosPorTipo: Record<string, number> = {
    "Cartão de Crédito": 0,
    Débito: 0,
    Pix: 0,
    Boleto: 0,
  }

  // Adicionar valores de gastos não parcelados
  gastos
    .filter((gasto) => gasto.parcelas <= 1)
    .forEach((gasto) => {
      gastosPorTipo[gasto.tipo] += gasto.valor
    })

  // Adicionar valores das parcelas
  parcelas.forEach((parcela) => {
    const gastoOriginal = gastos.find((g) => g.id === parcela.idGastoPrincipal)
    if (gastoOriginal) {
      gastosPorTipo[gastoOriginal.tipo] += parcela.valor
    }
  })

  return gastosPorTipo
}

export function calcularGastosMensais(parcelas: Parcela[], gastos: Gasto[]): Record<string, number> {
  const ultimosSeisMeses = obterUltimosSeisMeses()
  const gastosPorMes: Record<string, number> = {}

  // Inicializar o objeto com os últimos 6 meses
  ultimosSeisMeses.forEach((mes) => {
    gastosPorMes[mes.nome] = 0
  })

  // Adicionar valores de gastos não parcelados
  gastos
    .filter((gasto) => gasto.parcelas <= 1)
    .forEach((gasto) => {
      const dataGasto = new Date(gasto.dataVencimento)
      const mesAno = dataGasto.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })

      if (gastosPorMes[mesAno] !== undefined) {
        gastosPorMes[mesAno] += gasto.valor
      }
    })

  // Adicionar valores das parcelas
  parcelas.forEach((parcela) => {
    const dataParcela = new Date(parcela.dataVencimento)
    const mesAno = dataParcela.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })

    if (gastosPorMes[mesAno] !== undefined) {
      gastosPorMes[mesAno] += parcela.valor
    }
  })

  return gastosPorMes
}

export function obterUltimosSeisMeses() {
  const meses = []
  const hoje = new Date()

  for (let i = 5; i >= 0; i--) {
    const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    meses.push({
      nome: mes.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      mes: mes.getMonth(),
      ano: mes.getFullYear(),
    })
  }

  return meses
}

// Funções para o sistema de senha
export function hashSenha(senha: string): string {
  // Esta é uma implementação simples de hash para fins educativos
  // Em um ambiente de produção, use bcrypt ou similar
  let hash = 0
  for (let i = 0; i < senha.length; i++) {
    const char = senha.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Converte para um inteiro de 32 bits
  }
  return hash.toString(16)
}

export function verificarSenha(senha: string, hashArmazenado: string): boolean {
  const hashCalculado = hashSenha(senha)
  return hashCalculado === hashArmazenado
}

export function salvarConfiguracaoSenha(config: ConfiguracaoSenha) {
  localStorage.setItem("configSenha", JSON.stringify(config))
}

export function carregarConfiguracaoSenha(): ConfiguracaoSenha | null {
  const configSalva = localStorage.getItem("configSenha")
  if (configSalva) {
    return JSON.parse(configSalva)
  }
  return null
}