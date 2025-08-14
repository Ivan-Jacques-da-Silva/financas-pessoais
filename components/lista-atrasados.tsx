"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, AlertTriangle } from "lucide-react"
import { formatarMoeda } from "@/lib/utilidades"
import { Badge } from "@/components/ui/badge"
import type { Gasto, ContaFixa, StatusPagamento, Parcela } from "@/tipos"

interface ListaAtrasadosProps {
  gastos: Gasto[]
  contasFixas: ContaFixa[]
  parcelas: Parcela[]
  ocultarValores: boolean
  aoAtualizarStatusGasto: (id: string, status: StatusPagamento) => void
  aoAtualizarStatusContaFixa: (id: string, status: StatusPagamento) => void
  aoAtualizarStatusParcela: (id: string, status: StatusPagamento) => void
}

export default function ListaAtrasados({
  gastos,
  contasFixas,
  parcelas,
  ocultarValores,
  aoAtualizarStatusGasto,
  aoAtualizarStatusContaFixa,
  aoAtualizarStatusParcela,
}: ListaAtrasadosProps) {
  const totalAtrasados = gastos.length + contasFixas.length + parcelas.length

  if (totalAtrasados === 0) {
    return null
  }

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
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Pagamentos Atrasados ({totalAtrasados})</h2>
      </div>

      {gastos.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Gastos Atrasados</h3>
          <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800">
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <Table>
                <TableHeader className="bg-red-50 dark:bg-red-900/30 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gastos.map((gasto) => (
                    <TableRow key={gasto.id} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                      <TableCell className="font-medium">{gasto.descricao}</TableCell>
                      <TableCell>{ocultarValores ? "••••••" : formatarMoeda(gasto.valor)}</TableCell>
                      <TableCell>{new Date(gasto.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Badge variant={obterVarianteBadge(gasto.tipo)} className="font-normal">
                          {gasto.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => aoAtualizarStatusGasto(gasto.id, "Pago")}
                          className="flex items-center gap-1 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                        >
                          <Check className="h-4 w-4" />
                          Marcar como Pago
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {parcelas.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Parcelas Atrasadas</h3>
          <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800">
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <Table>
                <TableHeader className="bg-red-50 dark:bg-red-900/30 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcelas.map((parcela) => (
                    <TableRow key={parcela.id} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                      <TableCell className="font-medium">{parcela.descricao}</TableCell>
                      <TableCell>{ocultarValores ? "••••••" : formatarMoeda(parcela.valor)}</TableCell>
                      <TableCell>{new Date(parcela.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{`${parcela.numeroParcela}/${parcela.totalParcelas}`}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => aoAtualizarStatusParcela(parcela.id, "Pago")}
                          className="flex items-center gap-1 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                        >
                          <Check className="h-4 w-4" />
                          Marcar como Pago
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {contasFixas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Contas Fixas Atrasadas</h3>
          <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800">
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <Table>
                <TableHeader className="bg-red-50 dark:bg-red-900/30 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasFixas.map((conta) => (
                    <TableRow key={conta.id} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                      <TableCell className="font-medium">{conta.nome}</TableCell>
                      <TableCell>{ocultarValores ? "••••••" : formatarMoeda(conta.valor)}</TableCell>
                      <TableCell>{new Date(conta.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => aoAtualizarStatusContaFixa(conta.id, "Pago")}
                          className="flex items-center gap-1 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                        >
                          <Check className="h-4 w-4" />
                          Marcar como Pago
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
