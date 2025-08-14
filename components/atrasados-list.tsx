"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Gasto, ContaFixa, StatusPagamento } from "@/types"

interface AtrasadosListProps {
  gastos: Gasto[]
  contasFixas: ContaFixa[]
  hideValues: boolean
  onUpdateGastoStatus: (id: string, status: StatusPagamento) => void
  onUpdateContaFixaStatus: (id: string, status: StatusPagamento) => void
}

export default function AtrasadosList({
  gastos,
  contasFixas,
  hideValues,
  onUpdateGastoStatus,
  onUpdateContaFixaStatus,
}: AtrasadosListProps) {
  const totalAtrasados = gastos.length + contasFixas.length

  if (totalAtrasados === 0) {
    return null
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
            <Table>
              <TableHeader className="bg-red-50 dark:bg-red-900/30">
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
                    <TableCell>{hideValues ? "••••••" : formatCurrency(gasto.valor)}</TableCell>
                    <TableCell>{new Date(gasto.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{gasto.tipo}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateGastoStatus(gasto.id, "Pago")}
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
      )}

      {contasFixas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Contas Fixas Atrasadas</h3>
          <div className="overflow-x-auto rounded-lg border border-red-200 dark:border-red-800">
            <Table>
              <TableHeader className="bg-red-50 dark:bg-red-900/30">
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
                    <TableCell>{hideValues ? "••••••" : formatCurrency(conta.valor)}</TableCell>
                    <TableCell>{new Date(conta.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateContaFixaStatus(conta.id, "Pago")}
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
      )}
    </div>
  )
}
