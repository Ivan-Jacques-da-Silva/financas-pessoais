"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Check, Filter } from "lucide-react"
import { formatarMoeda, obterCorStatus } from "@/lib/utilidades"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Gasto, Parcela, StatusPagamento, TipoGasto } from "@/tipos"

interface ListaGastosParcelasProps {
  gastos: Gasto[]
  parcelas: Parcela[]
  ocultarValores: boolean
  aoRemoverGasto: (id: string) => void
  aoAtualizarStatusGasto: (id: string, status: StatusPagamento) => void
  aoAtualizarStatusParcela: (id: string, status: StatusPagamento) => void
}

type ItemLista = {
  id: string
  tipo: "gasto" | "parcela"
  descricao: string
  valor: number
  dataVencimento: string
  metodoPagamento: TipoGasto | string
  status: StatusPagamento
  parcela?: string
  idGastoPrincipal?: string
}

export default function ListaGastosParcelas({
  gastos,
  parcelas,
  ocultarValores,
  aoRemoverGasto,
  aoAtualizarStatusGasto,
  aoAtualizarStatusParcela,
}: ListaGastosParcelasProps) {
  const [filtroStatus, setFiltroStatus] = useState<StatusPagamento[]>(["Atrasado", "A Pagar", "Pago"])

  const obterVarianteBadge = (tipo: string) => {
    switch (tipo) {
      case "Cartão de Crédito":
        return "destructive"
      case "Débito":
        return "default"
      case "Pix":
        return "secondary"
      case "Boleto":
        return "outline"
      default:
        return "default"
    }
  }

  // Obter o tipo de gasto para cada parcela
  const obterTipoGasto = (idGastoPrincipal: string): TipoGasto => {
    const gasto = gastos.find((g) => g.id === idGastoPrincipal)
    return gasto?.tipo || "Débito"
  }

  // Combinar gastos e parcelas em uma única lista
  const itens: ItemLista[] = [
    // Adicionar gastos não parcelados
    ...gastos
      .filter((gasto) => gasto.parcelas <= 1)
      .map((gasto) => ({
        id: gasto.id,
        tipo: "gasto" as const,
        descricao: gasto.descricao,
        valor: gasto.valor,
        dataVencimento: gasto.dataVencimento,
        metodoPagamento: gasto.tipo,
        status: gasto.status,
      })),
    // Adicionar parcelas
    ...parcelas.map((parcela) => ({
      id: parcela.id,
      tipo: "parcela" as const,
      descricao: parcela.descricao,
      valor: parcela.valor,
      dataVencimento: parcela.dataVencimento,
      metodoPagamento: obterTipoGasto(parcela.idGastoPrincipal),
      status: parcela.status,
      parcela: `${parcela.numeroParcela}/${parcela.totalParcelas}`,
      idGastoPrincipal: parcela.idGastoPrincipal,
    })),
  ]

  // Ordenar itens: primeiro por status, depois por data de vencimento
  const itensOrdenados = [...itens]
    .filter((item) => filtroStatus.includes(item.status))
    .sort((a, b) => {
      const ordemStatus = { Atrasado: 0, "A Pagar": 1, Pago: 2 }
      // Primeiro por status
      if (ordemStatus[a.status] !== ordemStatus[b.status]) {
        return ordemStatus[a.status] - ordemStatus[b.status]
      }
      // Depois por data de vencimento
      return new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime()
    })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Gastos e Parcelas</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={filtroStatus.includes("Atrasado")}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFiltroStatus([...filtroStatus, "Atrasado"])
                } else {
                  setFiltroStatus(filtroStatus.filter((s) => s !== "Atrasado"))
                }
              }}
            >
              Atrasados
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filtroStatus.includes("A Pagar")}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFiltroStatus([...filtroStatus, "A Pagar"])
                } else {
                  setFiltroStatus(filtroStatus.filter((s) => s !== "A Pagar"))
                }
              }}
            >
              A Pagar
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filtroStatus.includes("Pago")}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFiltroStatus([...filtroStatus, "Pago"])
                } else {
                  setFiltroStatus(filtroStatus.filter((s) => s !== "Pago"))
                }
              }}
            >
              Pagos
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {itensOrdenados.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-lg">
          <p>Nenhum gasto ou parcela encontrado</p>
          <p className="text-sm mt-2">Adicione seu primeiro gasto usando o formulário</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itensOrdenados.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-900 ${
                      item.status === "Atrasado" ? "bg-red-50/50 dark:bg-red-900/10" : ""
                    }`}
                  >
                    <TableCell className="font-medium">{item.descricao}</TableCell>
                    <TableCell>{ocultarValores ? "••••••" : formatarMoeda(item.valor)}</TableCell>
                    <TableCell>{new Date(item.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <Badge variant={obterVarianteBadge(item.metodoPagamento)} className="font-normal">
                        {item.metodoPagamento}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.parcela || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${obterCorStatus(item.status)}`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.status !== "Pago" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (item.tipo === "gasto") {
                                aoAtualizarStatusGasto(item.id, "Pago")
                              } else {
                                aoAtualizarStatusParcela(item.id, "Pago")
                              }
                            }}
                            className="text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                            title="Marcar como pago"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {item.tipo === "gasto" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => aoRemoverGasto(item.id)}
                            className="text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
