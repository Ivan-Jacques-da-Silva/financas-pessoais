"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Gasto } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { useTheme } from "next-themes"
import { ChartContainer } from "@/components/ui/chart"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

interface GastosChartsProps {
  gastos: Gasto[]
  hideValues: boolean
}

export default function GastosCharts({ gastos, hideValues }: GastosChartsProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Dados para o gráfico de pizza (distribuição por tipo)
  const tipoGastoData = [
    { name: "Cartão de Crédito", value: 0 },
    { name: "Débito", value: 0 },
    { name: "Pix", value: 0 },
    { name: "Boleto", value: 0 },
  ]

  gastos.forEach((gasto) => {
    const index = tipoGastoData.findIndex((item) => item.name === gasto.tipo)
    if (index !== -1) {
      tipoGastoData[index].value += gasto.valor
    }
  })

  // Filtrar tipos sem valores
  const filteredTipoGastoData = tipoGastoData.filter((item) => item.value > 0)

  // Cores para o gráfico de pizza
  const COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f43f5e"]

  // Dados para o gráfico de linha (evolução por mês)
  const getLastSixMonths = () => {
    const months = []
    const today = new Date()

    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
      months.push({
        name: month.toLocaleDateString("pt-BR", { month: "short" }),
        month: month.getMonth(),
        year: month.getFullYear(),
      })
    }

    return months
  }

  const lastSixMonths = getLastSixMonths()

  const monthlyData = lastSixMonths.map((monthData) => {
    const monthlyTotal = gastos
      .filter((gasto) => {
        const gastoDate = new Date(gasto.dataVencimento)
        return gastoDate.getMonth() === monthData.month && gastoDate.getFullYear() === monthData.year
      })
      .reduce((total, gasto) => total + gasto.valor, 0)

    return {
      name: monthData.name,
      total: monthlyTotal,
    }
  })

  // Configuração do gráfico
  const chartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Distribuição por Tipo de Gasto</CardTitle>
          <CardDescription>Proporção de gastos por método de pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredTipoGastoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => (hideValues ? name : `${name}: ${(percent * 100).toFixed(0)}%`)}
                >
                  {filteredTipoGastoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => (hideValues ? ["••••••"] : [formatCurrency(Number(value))])} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Evolução de Gastos</CardTitle>
          <CardDescription>Total de gastos nos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <LineChart
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="name" stroke={isDark ? "#94a3b8" : "#64748b"} />
                <YAxis
                  stroke={isDark ? "#94a3b8" : "#64748b"}
                  tickFormatter={(value) => (hideValues ? "••••" : formatCurrency(value).substring(0, 3))}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Mês</span>
                              <span className="font-bold text-muted-foreground">{payload[0].payload.name}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Total</span>
                              <span className="font-bold">
                                {hideValues ? "••••••" : formatCurrency(payload[0].value as number)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line type="monotone" dataKey="total" stroke="#10b981" activeDot={{ r: 8 }} strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
