"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { formatarMoeda, obterCorStatus } from "@/lib/utilidades"
import { Badge } from "@/components/ui/badge"
import type { Parcela, Gasto, StatusPagamento } from "@/tipos"

interface ListaParcelasProps {
  parcelas: Parcela[]
  gastos: Gasto[]
  ocultarValores: boolean
  aoAtualizarStatus: (id: string, status: StatusPagamento) => void
}

export default function ListaParcelas({ parcelas, gastos, ocultarValores, aoAtualizarStatus }: ListaParcelasProps) {
  // Obter o tipo de gasto para cada parcela
  const obterTipoGasto = (idGastoPrincipal: string): string => {
    const gasto = gastos.find((g) => g.id === idGastoPrincipal)
    return gasto?.tipo || "Desconhecido"
  }

  // Ordenar parcelas: primeiro as atrasadas, depois as a pagar, por fim as pagas
  const parcelasOrdenadas = [...parcelas].sort((a, b) => {
    const ordemStatus = { Atrasado: 0, "A Pagar": 1, Pago: 2 }

    // Primeiro por status
    if (ordemStatus[a.status] !== ordemStatus[b.status]) {
      return ordemStatus[a.status] - ordemStatus[b.status]
    }

    // Depois por data de vencimento
    return new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime()
  })

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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Parcelas</h2>
      {parcelas.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-lg">
          <p>Nenhuma parcela cadastrada</p>
          <p className="text-sm mt-2">Adicione um gasto parcelado para visualizar as parcelas</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcelasOrdenadas.map((parcela) => (
                <TableRow
                  key={parcela.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-900 ${
                    parcela.status === "Atrasado" ? "bg-red-50/50 dark:bg-red-900/10" : ""
                  }`}
                >
                  <TableCell className="font-medium">{parcela.descricao}</TableCell>
                  <TableCell>{ocultarValores ? "••••••" : formatarMoeda(parcela.valor)}</TableCell>
                  <TableCell>{new Date(parcela.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{`${parcela.numeroParcela}/${parcela.totalParcelas}`}</TableCell>
                  <TableCell>
                    <Badge
                      variant={obterVarianteBadge(obterTipoGasto(parcela.idGastoPrincipal))}
                      className="font-normal"
                    >
                      {obterTipoGasto(parcela.idGastoPrincipal)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${obterCorStatus(parcela.status)}`}>
                      {parcela.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {parcela.status !== "Pago" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => aoAtualizarStatus(parcela.id, "Pago")}
                          className="text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                          title="Marcar como pago"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
