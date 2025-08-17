
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Gasto, ContaFixa, Parcela } from "../tipos"
import { formatarMoeda } from "@/lib/utilidades"
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

interface DashboardChartsProps {
  gastos: Gasto[]
  contasFixas: ContaFixa[]
  parcelas: Parcela[]
  ocultarValores: boolean
}

export default function DashboardCharts({ gastos, contasFixas, parcelas, ocultarValores }: DashboardChartsProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Calcular dados para o gráfico de pizza (todos os gastos por método)
  const calcularGastosPorMetodo = () => {
    const metodos = {
      "Cartão de Crédito": 0,
      "Débito": 0,
      "Pix": 0,
      "Boleto": 0,
    }

    // Somar todos os gastos por tipo
    gastos.forEach((gasto) => {
      let tipoFormatado = gasto.tipo
      
      // Mapear os tipos do banco para os tipos do frontend
      switch (gasto.tipo) {
        case "CARTAO_CREDITO":
          tipoFormatado = "Cartão de Crédito"
          break
        case "DEBITO":
          tipoFormatado = "Débito"
          break
        case "PIX":
          tipoFormatado = "Pix"
          break
        case "BOLETO":
          tipoFormatado = "Boleto"
          break
      }
      
      if (metodos.hasOwnProperty(tipoFormatado)) {
        metodos[tipoFormatado as keyof typeof metodos] += gasto.valor
      }
    })

    return Object.entries(metodos)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
  }

  // Calcular dados para o gráfico de linha (evolução por mês)
  const calcularEvolucaoMensal = () => {
    const meses = []
    const hoje = new Date()

    // Gerar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      meses.push({
        name: data.toLocaleDateString("pt-BR", { month: "short" }),
        month: data.getMonth(),
        year: data.getFullYear(),
        total: 0
      })
    }

    // Calcular total por mês
    meses.forEach((mesData) => {
      // Gastos do mês
      const gastosDoMes = gastos.filter((gasto) => {
        const dataGasto = new Date(gasto.dataVencimento)
        return dataGasto.getMonth() === mesData.month && dataGasto.getFullYear() === mesData.year
      })

      // Contas fixas do mês
      const contasDoMes = contasFixas.filter((conta) => {
        const dataConta = new Date(conta.dataVencimento)
        return dataConta.getMonth() === mesData.month && dataConta.getFullYear() === mesData.year
      })

      // Parcelas do mês
      const parcelasDoMes = parcelas.filter((parcela) => {
        const dataParcela = new Date(parcela.dataVencimento)
        return dataParcela.getMonth() === mesData.month && dataParcela.getFullYear() === mesData.year
      })

      mesData.total = 
        gastosDoMes.reduce((acc, gasto) => acc + gasto.valor, 0) +
        contasDoMes.reduce((acc, conta) => acc + conta.valor, 0) +
        parcelasDoMes.reduce((acc, parcela) => acc + parcela.valor, 0)
    })

    return meses
  }

  const dadosPizza = calcularGastosPorMetodo()
  const dadosLinha = calcularEvolucaoMensal()

  // Cores específicas para cada método de pagamento
  const getCorPorMetodo = (metodo: string) => {
    switch (metodo) {
      case "Cartão de Crédito":
        return "#10b981" // Verde (emerald-500)
      case "Débito":
        return "#3b82f6" // Azul (blue-500)
      case "Pix":
        return "#f59e0b" // Amarelo (amber-500)
      case "Boleto":
        return "#ef4444" // Vermelho (red-500)
      default:
        return "#6b7280" // Cinza (gray-500)
    }
  }

  // Configuração do gráfico
  const chartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico de Pizza - Distribuição por Método */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Seus Gastos por Método</CardTitle>
          <CardDescription>Distribuição dos seus gastos por método de pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {dadosPizza.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      ocultarValores ? name : `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {dadosPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCorPorMetodo(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => 
                      ocultarValores ? ["••••••"] : [formatarMoeda(Number(value))]
                    } 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium">Nenhum gasto cadastrado</p>
                  <p className="text-sm mt-2">Adicione gastos para ver a distribuição por método</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Linha - Evolução Mensal */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Evolução de Gastos</CardTitle>
          <CardDescription>Total de gastos nos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <LineChart
                data={dadosLinha}
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
                  tickFormatter={(value) => 
                    ocultarValores ? "••••" : formatarMoeda(value).substring(0, 3)
                  }
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
                                {ocultarValores ? "••••••" : formatarMoeda(payload[0].value as number)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2} 
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
