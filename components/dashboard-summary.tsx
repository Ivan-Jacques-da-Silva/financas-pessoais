"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { CreditCard, BarChart3, TrendingUp, AlertTriangle } from "lucide-react"
import type { Gasto, ContaFixa } from "@/types"

interface DashboardSummaryProps {
  gastos: Gasto[]
  contasFixas: ContaFixa[]
  hideValues: boolean
}

export default function DashboardSummary({ gastos, contasFixas, hideValues }: DashboardSummaryProps) {
  // Calcular total gasto com cartão de crédito no mês atual
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const totalCartaoCredito = gastos
    .filter(
      (gasto) =>
        gasto.tipo === "Cartão de Crédito" &&
        new Date(gasto.dataVencimento).getMonth() === currentMonth &&
        new Date(gasto.dataVencimento).getFullYear() === currentYear,
    )
    .reduce((acc, gasto) => acc + gasto.valor, 0)

  // Calcular total de gastos fixos
  const totalGastosFixos = contasFixas.reduce((acc, conta) => acc + conta.valor, 0)

  // Calcular gasto médio mensal (últimos 3 meses)
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const gastosRecentes = gastos.filter((gasto) => new Date(gasto.dataVencimento) >= threeMonthsAgo)

  const totalGastosRecentes = gastosRecentes.reduce((acc, gasto) => acc + gasto.valor, 0)
  const gastoMedioMensal = gastosRecentes.length > 0 ? totalGastosRecentes / 3 : 0

  // Calcular total de pagamentos atrasados
  const gastosAtrasados = gastos.filter((gasto) => gasto.status === "Atrasado")
  const contasAtrasadas = contasFixas.filter((conta) => conta.status === "Atrasado")

  const totalAtrasados =
    gastosAtrasados.reduce((acc, gasto) => acc + gasto.valor, 0) +
    contasAtrasadas.reduce((acc, conta) => acc + conta.valor, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Cartão de Crédito</CardTitle>
          <CreditCard className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{hideValues ? "••••••" : formatCurrency(totalCartaoCredito)}</div>
          <CardDescription>Total no mês atual</CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Gastos Fixos</CardTitle>
          <BarChart3 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{hideValues ? "••••••" : formatCurrency(totalGastosFixos)}</div>
          <CardDescription>Total mensal</CardDescription>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{hideValues ? "••••••" : formatCurrency(gastoMedioMensal)}</div>
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
            {totalAtrasados > 0 ? (hideValues ? "••••••" : formatCurrency(totalAtrasados)) : "R$ 0,00"}
          </div>
          <CardDescription className={totalAtrasados > 0 ? "text-red-600 dark:text-red-400" : ""}>
            {gastosAtrasados.length + contasAtrasadas.length} item(s) atrasado(s)
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
