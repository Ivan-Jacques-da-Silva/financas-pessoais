import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Gasto, ContaFixa, StatusPagamento } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function getStatusPagamento(dataVencimento: string): StatusPagamento {
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

export function getStatusColor(status: StatusPagamento): string {
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

export function saveAppState(state: any) {
  localStorage.setItem("appState", JSON.stringify(state))
}

export function loadAppState() {
  const savedState = localStorage.getItem("appState")
  if (savedState) {
    return JSON.parse(savedState)
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
      status: getStatusPagamento(gasto.dataVencimento),
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
      status: getStatusPagamento(conta.dataVencimento),
    }
  })
}
