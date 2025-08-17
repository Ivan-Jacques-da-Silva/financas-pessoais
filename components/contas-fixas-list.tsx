"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Check } from "lucide-react"
import { formatCurrency, getStatusColor } from "@/lib/utils"
import { formatarMoeda } from "@/lib/utilidades"
import type { ContaFixa, StatusPagamento } from "@/types"

interface ContasFixasListProps {
  contasFixas: ContaFixa[]
  hideValues: boolean
  onRemoveContaFixa: (id: string) => void
  onUpdateStatus: (id: string, status: StatusPagamento) => void
}

export default function ContasFixasList({
  contasFixas,
  hideValues,
  onRemoveContaFixa,
  onUpdateStatus,
}: ContasFixasListProps) {
  // Ordenar contas fixas: primeiro as atrasadas, depois as a pagar, por fim as pagas
  const sortedContasFixas = [...contasFixas].sort((a, b) => {
    const statusOrder = { Atrasado: 0, "A Pagar": 1, Pago: 2 }
    return statusOrder[a.status] - statusOrder[b.status]
  })

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Contas Fixas Mensais</h2>
      {contasFixas.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-lg">
          <p>Nenhuma conta fixa cadastrada</p>
          <p className="text-sm mt-2">Adicione sua primeira conta fixa usando o formulário</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Valor Mensal</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContasFixas.map((conta) => (
                <TableRow
                  key={conta.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-900 ${
                    conta.status === "Atrasado" ? "bg-red-50/50 dark:bg-red-900/10" : ""
                  }`}
                >
                  <TableCell className="font-medium">{conta.nome}</TableCell>
                  <TableCell>{hideValues ? "••••••" : formatarMoeda(conta.valor)}</TableCell>
                  <TableCell>{new Date(conta.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      conta.status === "Atrasado" 
                        ? "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" 
                        : getStatusColor(conta.status)
                    }`}>
                      {conta.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {conta.status !== "Pago" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onUpdateStatus(conta.id, "Pago")}
                          className="text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                          title="Marcar como pago"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveContaFixa(conta.id)}
                        className="text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
g