"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Check } from "lucide-react"
import { formatarMoeda, obterCorStatus } from "@/lib/utilidades"
import type { ContaFixa, StatusPagamento } from "@/tipos"

interface ListaContasFixasProps {
  contasFixas: ContaFixa[]
  ocultarValores: boolean
  aoRemoverContaFixa: (id: string) => void
  aoAtualizarStatus: (id: string, status: StatusPagamento) => void
}

export default function ListaContasFixas({
  contasFixas,
  ocultarValores,
  aoRemoverContaFixa,
  aoAtualizarStatus,
}: ListaContasFixasProps) {
  // Ordenar contas fixas: primeiro as atrasadas, depois as a pagar, por fim as pagas
  const contasFixasOrdenadas = [...contasFixas].sort((a, b) => {
    const ordemStatus = { Atrasado: 0, "A Pagar": 1, Pago: 2 }
    return ordemStatus[a.status] - ordemStatus[b.status]
  })

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Gastos Fixos Mensais</h2>
      {contasFixas.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-lg">
          <p>Nenhum gasto fixo cadastrado</p>
          <p className="text-sm mt-2">Adicione seu primeiro gasto fixo usando o formulário</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor Mensal</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasFixasOrdenadas.map((conta) => (
                  <TableRow
                    key={conta.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-900 ${
                      conta.status === "Atrasado" ? "bg-red-50/50 dark:bg-red-900/10" : ""
                    }`}
                  >
                    <TableCell className="font-medium">{conta.nome}</TableCell>
                    <TableCell>{ocultarValores ? "••••••" : formatarMoeda(conta.valor)}</TableCell>
                    <TableCell>{new Date(conta.dataVencimento).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${obterCorStatus(conta.status)}`}>
                        {conta.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {conta.status !== "Pago" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => aoAtualizarStatus(conta.id, "Pago")}
                            className="text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                            title="Marcar como pago"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => aoRemoverContaFixa(conta.id)}
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
        </div>
      )}
    </div>
  )
}
