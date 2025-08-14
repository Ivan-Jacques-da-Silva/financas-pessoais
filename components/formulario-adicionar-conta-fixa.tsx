"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { obterStatusPagamento } from "@/lib/utilidades"
import type { ContaFixa } from "@/tipos"

const esquemaFormulario = z.object({
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  valor: z.coerce.number().positive({ message: "Valor deve ser positivo" }),
  dataVencimento: z.string(),
})

interface FormularioAdicionarContaFixaProps {
  aoAdicionarContaFixa: (contaFixa: ContaFixa) => void
}

export default function FormularioAdicionarContaFixa({ aoAdicionarContaFixa }: FormularioAdicionarContaFixaProps) {
  const form = useForm<z.infer<typeof esquemaFormulario>>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      nome: "",
      valor: 0,
      dataVencimento: new Date().toISOString().split("T")[0],
    },
  })

  function aoEnviar(valores: z.infer<typeof esquemaFormulario>) {
    // Determinar o status com base na data de vencimento
    const status = obterStatusPagamento(valores.dataVencimento)

    aoAdicionarContaFixa({
      id: crypto.randomUUID(),
      ...valores,
      status,
    })

    form.reset({
      nome: "",
      valor: 0,
      dataVencimento: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Adicionar Gasto Fixo</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(aoEnviar)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Aluguel" {...field} className="border-slate-200 dark:border-slate-700" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Mensal (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} className="border-slate-200 dark:border-slate-700" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataVencimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vencimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="border-slate-200 dark:border-slate-700" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
            Adicionar Gasto Fixo
          </Button>
        </form>
      </Form>
    </div>
  )
}
