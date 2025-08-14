"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ModalSenhaProps {
  aberto: boolean
  aoFechar: () => void
  aoConfirmar: (senha: string) => void
  titulo: string
  mensagem?: string
  modoDefinicao?: boolean
  erro?: string
}

export default function ModalSenha({
  aberto,
  aoFechar,
  aoConfirmar,
  titulo,
  mensagem,
  modoDefinicao = false,
  erro,
}: ModalSenhaProps) {
  const [senha, setSenha] = useState("")
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("")
  const [erroInterno, setErroInterno] = useState<string | undefined>(erro)

  useEffect(() => {
    setErroInterno(erro)
  }, [erro])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (modoDefinicao) {
      if (senha.length < 4) {
        setErroInterno("A senha deve ter pelo menos 4 caracteres")
        return
      }

      if (senha !== confirmacaoSenha) {
        setErroInterno("As senhas não coincidem")
        return
      }
    }

    aoConfirmar(senha)
    setSenha("")
    setConfirmacaoSenha("")
    setErroInterno(undefined)
  }

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && aoFechar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {mensagem && <p className="text-sm text-slate-500 dark:text-slate-400">{mensagem}</p>}

            {erroInterno && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{erroInterno}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="new-password"
                className="border-slate-200 dark:border-slate-700"
              />
            </div>

            {modoDefinicao && (
              <div className="grid gap-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  value={confirmacaoSenha}
                  onChange={(e) => setConfirmacaoSenha(e.target.value)}
                  placeholder="Confirme sua senha"
                  autoComplete="new-password"
                  className="border-slate-200 dark:border-slate-700"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
