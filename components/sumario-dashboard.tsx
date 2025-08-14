"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatarMoeda } from "@/lib/utilidades"
import { CreditCard, BarChart3, TrendingUp, AlertTriangle } from "lucide-react"
import type { Gasto, ContaFixa, Parcela } from "@/tipos"

interface SumarioDashboardProps {
  gastos: Gasto[]
  contasFixas: ContaFixa[]
  parcelas: Parcela[]
  ocultarValores: boolean
}

export default function SumarioDashboard({ gastos, contasFixas, parcelas, ocultarValores }: SumarioDashboardProps) {
  // Calcular total gasto com cartão de crédito no mês atual
  const mesAtual = new Date().getMonth()
  const anoAtual = new Date().getFullYear()

  // Gastos não parcelados
  const totalCartaoCreditoGastos = gastos
    .filter(
      (gasto) =>
        gasto.tipo === "Cartão de Crédito" &&
        gasto.parcelas <= 1 &&
        new Date(gasto.dataVencimento).getMonth() === mesAtual &&
        new Date(gasto.dataVencimento).getFullYear() === anoAtual,
    )
    .reduce((acc, gasto) => acc + gasto.valor, 0)

  // Parcelas
  const totalCartaoCreditoParcelas = parcelas
    .filter((parcela) => {
      const gastoOriginal = gastos.find((g) => g.id === parcela.idGastoPrincipal)
      return (
        gastoOriginal?.tipo === "Cartão de Crédito" &&
        new Date(parcela.dataVencimento).getMonth() === mesAtual &&
        new Date(parcela.dataVencimento).getFullYear() === anoAtual
      )
    })
    .reduce((acc, parcela) => acc + parcela.valor, 0)

  const totalCartaoCredito = totalCartaoCreditoGastos + totalCartaoCreditoParcelas

  // Calcular total de gastos fixos
  const totalGastosFixos = contasFixas.reduce((acc, conta) => acc + conta.valor, 0)

  // Calcular gasto médio mensal (últimos 3 meses)
  const tresMesesAtras = new Date()
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3)

  // Gastos não parcelados recentes
  const gastosRecentes = gastos
    .filter((gasto) => gasto.parcelas <= 1 && new Date(gasto.dataVencimento) >= tresMesesAtras)
    .reduce((acc, gasto) => acc + gasto.valor, 0)

  // Parcelas recentes
  const parcelasRecentes = parcelas
    .filter((parcela) => new Date(parcela.dataVencimento) >= tresMesesAtras)
    .reduce((acc, parcela) => acc + parcela.valor, 0)

  const totalGastosRecentes = gastosRecentes + parcelasRecentes
  const gastoMedioMensal = totalGastosRecentes / 3

  // Calcular total de pagamentos atrasados
  const gastosAtrasados = gastos
    .filter((gasto) => gasto.status === "Atrasado" && gasto.parcelas <= 1)
    .reduce((acc, gasto) => acc + gasto.valor, 0)

  const contasAtrasadas = contasFixas
    .filter((conta) => conta.status === "Atrasado")
    .reduce((acc, conta) => acc + conta.valor, 0)

  const parcelasAtrasadas = parcelas
    .filter((parcela) => parcela.status === "Atrasado")
    .reduce((acc, parcela) => acc + parcela.valor, 0)

  const totalAtrasados = gastosAtrasados + contasAtrasadas + parcelasAtrasadas
  const totalItensAtrasados =
    gastos.filter((g) => g.status === "Atrasado" && g.parcelas <= 1).length +
    contasFixas.filter((c) => c.status === "Atrasado").length +
    parcelas.filter((p) => p.status === "Atrasado").length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Cartão de Crédito</CardTitle>
          <CreditCard className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ocultarValores ? "••••••" : formatarMoeda(totalCartaoCredito)}</div>
          <CardDescription>Total no mês atual</CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Gastos Fixos</CardTitle>
          <BarChart3 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ocultarValores ? "••••••" : formatarMoeda(totalGastosFixos)}</div>
          <CardDescription>Total mensal</CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ocultarValores ? "••••••" : formatarMoeda(gastoMedioMensal)}</div>
          <CardDescription>Últimos 3 meses</CardDescription>
        </CardContent>
      </Card>

      <Card
        className={`shadow-sm hover:shadow-md transition-shadow ${
          totalAtrasados > 0
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className={`text-sm font-medium ${totalAtrasados > 0 ? "text-red-700 dark:text-red-400" : ""}`}>
            Pagamentos Atrasados
          </CardTitle>
          <AlertTriangle className={`h-4 w-4 ${totalAtrasados > 0 ? "text-red-500" : "text-emerald-500"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalAtrasados > 0 ? "text-red-700 dark:text-red-400" : ""}`}>
            {totalAtrasados > 0 ? (ocultarValores ? "••••••" : formatarMoeda(totalAtrasados)) : "R$ 0,00"}
          </div>
          <CardDescription className={totalAtrasados > 0 ? "text-red-600 dark:text-red-400" : ""}>
            {totalItensAtrasados} item(s) atrasado(s)
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
