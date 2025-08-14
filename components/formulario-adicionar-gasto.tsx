"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { obterStatusPagamento } from "@/lib/utilidades"
import type { Gasto } from "@/tipos"

const esquemaFormulario = z.object({
  descricao: z.string().min(3, { message: "Descrição deve ter pelo menos 3 caracteres" }),
  valor: z.coerce.number().positive({ message: "Valor deve ser positivo" }),
  dataVencimento: z.string(),
  tipo: z.enum(["Cartão de Crédito", "Débito", "Pix", "Boleto"]),
  parcelas: z.coerce.number().int().min(1, { message: "Mínimo de 1 parcela" }),
})

interface FormularioAdicionarGastoProps {
  aoAdicionarGasto: (gasto: Gasto) => void
}

export default function FormularioAdicionarGasto({ aoAdicionarGasto }: FormularioAdicionarGastoProps) {
  const form = useForm<z.infer<typeof esquemaFormulario>>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      descricao: "",
      valor: 0,
      dataVencimento: new Date().toISOString().split("T")[0],
      tipo: "Cartão de Crédito",
      parcelas: 1,
    },
  })

  function aoEnviar(valores: z.infer<typeof esquemaFormulario>) {
    // Determinar o status com base na data de vencimento
    const status = obterStatusPagamento(valores.dataVencimento)

    aoAdicionarGasto({
      id: crypto.randomUUID(),
      ...valores,
      parcelaAtual: 1,
      data: new Date().toISOString(), // Adicionar data de criação para gráficos
      status,
    })

    form.reset({
      descricao: "",
      valor: 0,
      dataVencimento: new Date().toISOString().split("T")[0],
      tipo: "Cartão de Crédito",
      parcelas: 1,
    })
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Adicionar Gasto</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(aoEnviar)} className="space-y-4">
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Supermercado" {...field} className="border-slate-200 dark:border-slate-700" />
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
                <FormLabel>Valor (R$)</FormLabel>
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

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Pagamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parcelas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Parcelas</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} className="border-slate-200 dark:border-slate-700" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
            Adicionar Gasto
          </Button>
        </form>
      </Form>
    </div>
  )
}
