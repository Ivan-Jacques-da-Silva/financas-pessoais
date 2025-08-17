'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, BarChart3, TrendingUp, AlertTriangle } from "lucide-react"
import type { Gasto, ContaFixa } from "../tipos"

interface SumarioDashboardProps {
  gastos: Gasto[]
  contasFixas: ContaFixa[]
  ocultarValores: boolean
}

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

export default function SumarioDashboard({ gastos, contasFixas, ocultarValores }: SumarioDashboardProps) {
  const mesAtual = new Date().getMonth()
  const anoAtual = new Date().getFullYear()

  // 1. Contas Fixas - Total mensal
  const totalContasFixas = contasFixas.reduce((acc, conta) => acc + conta.valor, 0)

  // 2. Contas Mensais - Gastos do mês atual
  const gastosDoMes = gastos
    .filter(gasto => {
      const dataGasto = new Date(gasto.dataVencimento)
      return dataGasto.getMonth() === mesAtual && dataGasto.getFullYear() === anoAtual
    })
    .reduce((acc, gasto) => acc + gasto.valor, 0)

  // 3. Média Mensal - Últimos 3 meses
  const tresUltimosMeses = []
  for (let i = 2; i >= 0; i--) {
    const data = new Date()
    data.setMonth(data.getMonth() - i)
    tresUltimosMeses.push(data)
  }

  const totalTresUltimosMeses = tresUltimosMeses.reduce((total, mes) => {
    const gastosDoMesCalculo = gastos
      .filter(gasto => {
        const dataGasto = new Date(gasto.dataVencimento)
        return dataGasto.getMonth() === mes.getMonth() && dataGasto.getFullYear() === mes.getFullYear()
      })
      .reduce((acc, gasto) => acc + gasto.valor, 0)

    return total + gastosDoMesCalculo
  }, 0)

  const mediaMensal = totalTresUltimosMeses / 3

  // 4. Pagamentos Atrasados
  const gastosAtrasados = gastos.filter(gasto => gasto.status === "Atrasado")
  const contasAtrasadas = contasFixas.filter(conta => conta.status === "Atrasado")
  const totalAtrasados = [...gastosAtrasados, ...contasAtrasadas]
    .reduce((acc, item) => acc + item.valor, 0)
  const totalItensAtrasados = gastosAtrasados.length + contasAtrasadas.length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Contas Fixas */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Contas Fixas</CardTitle>
          <BarChart3 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {ocultarValores ? "••••••" : formatarMoeda(totalContasFixas)}
          </div>
          <CardDescription>Total mensal</CardDescription>
        </CardContent>
      </Card>

      {/* Contas Mensais */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Contas Mensais</CardTitle>
          <CreditCard className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {ocultarValores ? "••••••" : formatarMoeda(gastosDoMes)}
          </div>
          <CardDescription>Gastos do mês atual</CardDescription>
        </CardContent>
      </Card>

      {/* Média Mensal */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {ocultarValores ? "••••••" : formatarMoeda(mediaMensal)}
          </div>
          <CardDescription>Últimos 3 meses</CardDescription>
        </CardContent>
      </Card>

      {/* Pagamentos Atrasados */}
      <Card
        className={`shadow-sm hover:shadow-md transition-shadow ${
          totalItensAtrasados > 0
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className={`text-sm font-medium ${totalItensAtrasados > 0 ? "text-red-700 dark:text-red-400" : ""}`}>
            Pagamentos Atrasados
          </CardTitle>
          <AlertTriangle className={`h-4 w-4 ${totalItensAtrasados > 0 ? "text-red-500" : "text-emerald-500"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalAtrasados > 0 ? "text-red-700 dark:text-red-400" : ""}`}>
            {ocultarValores ? "••••••" : (totalAtrasados > 0 ? formatarMoeda(totalAtrasados) : "R$ 0,00")}
          </div>
          <CardDescription className={totalItensAtrasados > 0 ? "text-red-600 dark:text-red-400" : ""}>
            {totalItensAtrasados} item(s) atrasado(s)
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}