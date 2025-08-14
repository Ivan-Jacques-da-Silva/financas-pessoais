"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { salvarDadosFirebase, carregarDadosFirebase } from "@/lib/firebase-funcoes"
import ListaGastosParcelas from "@/components/lista-gastos-parcelas"
import ListaContasFixas from "@/components/lista-contas-fixas"
import FormularioAdicionarGasto from "@/components/formulario-adicionar-gasto"
import FormularioAdicionarContaFixa from "@/components/formulario-adicionar-conta-fixa"
import SumarioDashboard from "@/components/sumario-dashboard"
import GraficosGastos from "@/components/graficos-gastos"
import ListaAtrasados from "@/components/lista-atrasados"
import ModalSenha from "@/components/modal-senha"
import { criptografar, descriptografar } from "@/lib/criptografia"

import type {
  Gasto,
  ContaFixa,
  EstadoApp,
  Parcela,
  StatusPagamento,
} from "@/tipos"
import {
  atualizarStatusGastos,
  atualizarStatusContasFixas,
  atualizarStatusParcelas,
  gerarParcelas,
  hashSenha,
  verificarSenha,
} from "@/lib/utilidades"

export default function Home() {
  const [ocultarValores, setOcultarValores] = useState(true)
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [contasFixas, setContasFixas] = useState<ContaFixa[]>([])
  const [parcelas, setParcelas] = useState<Parcela[]>([])
  const [abaAtiva, setAbaAtiva] = useState("dashboard")
  const [temAtrasados, setTemAtrasados] = useState(false)

  const [senhaDefinida, setSenhaDefinida] = useState(false)
  const [hashSenhaAtual, setHashSenhaAtual] = useState<string>("")
  const [modalDefinirSenhaAberto, setModalDefinirSenhaAberto] = useState(false)
  const [modalVerificarSenhaAberto, setModalVerificarSenhaAberto] = useState(false)
  const [erroSenha, setErroSenha] = useState<string | undefined>()

  useEffect(() => {
    async function carregarDados() {
      const dadosCriptografados = await carregarDadosFirebase()
      const estadoSalvo = dadosCriptografados ? descriptografar(dadosCriptografados) : null

      if (estadoSalvo) {
        setGastos(atualizarStatusGastos(estadoSalvo.gastos || []))
        setContasFixas(atualizarStatusContasFixas(estadoSalvo.contasFixas || []))
        setParcelas(atualizarStatusParcelas(estadoSalvo.parcelas || []))
        setOcultarValores(estadoSalvo.ocultarValores ?? true)

        if (estadoSalvo.senhaDefinida && estadoSalvo.hashSenha) {
          setSenhaDefinida(true)
          setHashSenhaAtual(estadoSalvo.hashSenha)
        } else {
          setModalDefinirSenhaAberto(true)
        }
      } else {
        setModalDefinirSenhaAberto(true)
      }
    }

    carregarDados()
  }, [])

  useEffect(() => {
    const estadoApp: EstadoApp = {
      gastos,
      contasFixas,
      ocultarValores,
      parcelas,
      senhaDefinida,
      hashSenha: hashSenhaAtual,
    }

    salvarDadosFirebase(criptografar(estadoApp))
  }, [gastos, contasFixas, ocultarValores, parcelas, senhaDefinida, hashSenhaAtual])

  useEffect(() => {
    const gastosAtrasados = gastos.filter((gasto) => gasto.status === "Atrasado" && gasto.parcelas <= 1)
    const contasAtrasadas = contasFixas.filter((conta) => conta.status === "Atrasado")
    const parcelasAtrasadas = parcelas.filter((parcela) => parcela.status === "Atrasado")
    setTemAtrasados(gastosAtrasados.length > 0 || contasAtrasadas.length > 0 || parcelasAtrasadas.length > 0)
  }, [gastos, contasFixas, parcelas])

  const adicionarGasto = (gasto: Gasto) => {
    setGastos((prev) => [...prev, gasto])
    if (gasto.parcelas > 1) {
      const novasParcelas = gerarParcelas(gasto)
      setParcelas((prev) => [...prev, ...novasParcelas])
    }
  }

  const adicionarContaFixa = (contaFixa: ContaFixa) => {
    setContasFixas([...contasFixas, contaFixa])
  }

  const removerGasto = (id: string) => {
    setGastos(gastos.filter((g) => g.id !== id))
    setParcelas(parcelas.filter((p) => p.idGastoPrincipal !== id))
  }

  const removerContaFixa = (id: string) => {
    setContasFixas(contasFixas.filter((c) => c.id !== id))
  }

  const atualizarStatusGasto = (id: string, status: StatusPagamento) => {
    setGastos(gastos.map((g) => (g.id === id ? { ...g, status } : g)))
  }

  const atualizarStatusContaFixa = (id: string, status: StatusPagamento) => {
    setContasFixas(contasFixas.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  const atualizarStatusParcela = (id: string, status: StatusPagamento) => {
    setParcelas(parcelas.map((p) => (p.id === id ? { ...p, status } : p)))
  }

  const definirSenha = (senha: string) => {
    const hash = hashSenha(senha)
    setHashSenhaAtual(hash)
    setSenhaDefinida(true)
    setModalDefinirSenhaAberto(false)
    setOcultarValores(false)
  }

  const verificarSenhaUsuario = (senha: string) => {
    if (verificarSenha(senha, hashSenhaAtual)) {
      setOcultarValores(false)
      setModalVerificarSenhaAberto(false)
      setErroSenha(undefined)
    } else {
      setErroSenha("Senha incorreta")
    }
  }

  const alternarOcultarValores = () => {
    if (ocultarValores) {
      if (senhaDefinida) {
        setModalVerificarSenhaAberto(true)
      } else {
        setOcultarValores(false)
      }
    } else {
      setOcultarValores(true)
    }
  }


  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pt-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Gestão Financeira Pessoal
          </h1>
          <Button
            variant="outline"
            onClick={alternarOcultarValores}
            className="flex items-center gap-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900"
          >
            {ocultarValores ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {ocultarValores ? "Mostrar Valores" : "Ocultar Valores"}
          </Button>
        </div>

        {temAtrasados && (
          <Card className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <ListaAtrasados
                gastos={gastos.filter((g) => g.status === "Atrasado" && g.parcelas <= 1)}
                contasFixas={contasFixas.filter((c) => c.status === "Atrasado")}
                parcelas={parcelas.filter((p) => p.status === "Atrasado")}
                ocultarValores={ocultarValores}
                aoAtualizarStatusGasto={atualizarStatusGasto}
                aoAtualizarStatusContaFixa={atualizarStatusContaFixa}
                aoAtualizarStatusParcela={atualizarStatusParcela}
              />
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="dashboard" value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="gastos-parcelas">Gastos e Parcelas</TabsTrigger>
            <TabsTrigger value="contas-fixas">Gastos Fixos</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <SumarioDashboard
              gastos={gastos}
              contasFixas={contasFixas}
              parcelas={parcelas}
              ocultarValores={ocultarValores}
            />
            <GraficosGastos gastos={gastos} parcelas={parcelas} ocultarValores={ocultarValores} />
          </TabsContent>

          <TabsContent value="gastos-parcelas">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6">
                  <FormularioAdicionarGasto aoAdicionarGasto={adicionarGasto} />
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6">
                  <ListaGastosParcelas
                    gastos={gastos}
                    parcelas={parcelas}
                    ocultarValores={ocultarValores}
                    aoRemoverGasto={removerGasto}
                    aoAtualizarStatusGasto={atualizarStatusGasto}
                    aoAtualizarStatusParcela={atualizarStatusParcela}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contas-fixas">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6">
                  <FormularioAdicionarContaFixa aoAdicionarContaFixa={adicionarContaFixa} />
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6">
                  <ListaContasFixas
                    contasFixas={contasFixas}
                    ocultarValores={ocultarValores}
                    aoRemoverContaFixa={removerContaFixa}
                    aoAtualizarStatus={atualizarStatusContaFixa}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal para definir senha */}
      <ModalSenha
        aberto={modalDefinirSenhaAberto}
        aoFechar={() => {
          if (!senhaDefinida) {
            // Se a senha ainda não foi definida, não permitir fechar o modal
            return
          }
          setModalDefinirSenhaAberto(false)
        }}
        aoConfirmar={definirSenha}
        titulo="Definir Senha"
        mensagem="Defina uma senha para proteger seus dados financeiros."
        modoDefinicao={true}
        erro={erroSenha}
      />

      {/* Modal para verificar senha */}
      <ModalSenha
        aberto={modalVerificarSenhaAberto}
        aoFechar={() => setModalVerificarSenhaAberto(false)}
        aoConfirmar={verificarSenhaUsuario}
        titulo="Digite sua Senha"
        mensagem="Digite sua senha para visualizar os valores."
        erro={erroSenha}
      />
    </main>
  )
}
