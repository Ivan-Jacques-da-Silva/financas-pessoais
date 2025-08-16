'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, LogOut } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ModalSenha from "@/components/modal-senha"
import FormularioAdicionarGasto from "@/components/formulario-adicionar-gasto"
import ListaGastos from "@/components/lista-gastos"
import FormularioAdicionarContaFixa from "@/components/formulario-adicionar-conta-fixa"
import ListaContasFixas from "@/components/lista-contas-fixas"
import SumarioDashboard from "@/components/sumario-dashboard"
import GraficosGastos from "@/components/graficos-gastos"
import ListaAtrasados from "@/components/lista-atrasados"
import type { Usuario, Gasto, ContaFixa, StatusPagamento } from "../tipos"

const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'

export default function Home() {
  // Estados de autenticação
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loginForm, setLoginForm] = useState({ email: "", senha: "" })
  const [cadastroForm, setCadastroForm] = useState({ nome: "", email: "", senha: "" })
  const [modoLogin, setModoLogin] = useState(true)
  const [erroAuth, setErroAuth] = useState("")
  const [carregandoAuth, setCarregandoAuth] = useState(false)

  // Estados do sistema de senha para ocultar valores
  const [senhaDefinida, setSenhaDefinida] = useState(false)
  const [ocultarValores, setOcultarValores] = useState(false)
  const [modalDefinirSenhaAberto, setModalDefinirSenhaAberto] = useState(false)
  const [modalVerificarSenhaAberto, setModalVerificarSenhaAberto] = useState(false)
  const [senhaHash, setSenhaHash] = useState("")
  const [erroSenha, setErroSenha] = useState("")

  // Estados dos dados
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [contasFixas, setContasFixas] = useState<ContaFixa[]>([])

  // Verificar se usuário está logado ao carregar
  useEffect(() => {
    verificarUsuarioLogado()
  }, [])

  // Verificar configuração de senha ao fazer login
  useEffect(() => {
    if (usuario) {
      carregarConfiguracaoSenha()
      carregarDados()
    }
  }, [usuario])

  const verificarUsuarioLogado = async () => {
    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUsuario(userData)
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
    }
  }

  const realizarLogin = async () => {
    if (!loginForm.email || !loginForm.senha) {
      setErroAuth("Email e senha são obrigatórios")
      return
    }

    setCarregandoAuth(true)
    setErroAuth("")

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        setUsuario(data.user)
        setLoginForm({ email: "", senha: "" })
      } else {
        setErroAuth(data.error || 'Erro ao fazer login')
      }
    } catch (error) {
      setErroAuth('Erro de conexão com o servidor')
      console.error('Erro no login:', error)
    } finally {
      setCarregandoAuth(false)
    }
  }

  const realizarCadastro = async () => {
    if (!cadastroForm.nome || !cadastroForm.email || !cadastroForm.senha) {
      setErroAuth("Todos os campos são obrigatórios")
      return
    }

    setCarregandoAuth(true)
    setErroAuth("")

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cadastroForm)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        setUsuario(data.user)
        setCadastroForm({ nome: "", email: "", senha: "" })
      } else {
        setErroAuth(data.error || 'Erro ao criar conta')
      }
    } catch (error) {
      setErroAuth('Erro de conexão com o servidor')
      console.error('Erro no cadastro:', error)
    } finally {
      setCarregandoAuth(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('senhaConfig')
    setUsuario(null)
    setSenhaDefinida(false)
    setOcultarValores(false)
    setSenhaHash("")
    setGastos([])
    setContasFixas([])
  }

  // Funções do sistema de senha
  const carregarConfiguracaoSenha = () => {
    const configSalva = localStorage.getItem('senhaConfig')
    if (configSalva) {
      const config = JSON.parse(configSalva)
      setSenhaDefinida(true)
      setSenhaHash(config.hash)
      setOcultarValores(true)
    } else {
      setModalDefinirSenhaAberto(true)
    }
  }

  const hashSenha = (senha: string): string => {
    let hash = 0
    for (let i = 0; i < senha.length; i++) {
      const char = senha.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return hash.toString(16)
  }

  const definirSenha = (senha: string) => {
    const hash = hashSenha(senha)
    const config = { hash, definida: true }
    localStorage.setItem('senhaConfig', JSON.stringify(config))
    setSenhaHash(hash)
    setSenhaDefinida(true)
    setOcultarValores(false)
    setModalDefinirSenhaAberto(false)
    setErroSenha("")
  }

  const verificarSenha = (senha: string) => {
    const hashCalculado = hashSenha(senha)
    if (hashCalculado === senhaHash) {
      setOcultarValores(!ocultarValores)
      setModalVerificarSenhaAberto(false)
      setErroSenha("")
    } else {
      setErroSenha("Senha incorreta")
    }
  }

  const toggleOcultarValores = () => {
    if (senhaDefinida) {
      setModalVerificarSenhaAberto(true)
    }
  }

  // Funções para carregar dados
  const carregarDados = async () => {
    await Promise.all([carregarGastos(), carregarContasFixas()])
  }

  const carregarGastos = async () => {
    try {
      const response = await fetch(`${API_URL}/gastos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setGastos(data)
      }
    } catch (error) {
      console.error('Erro ao carregar gastos:', error)
    }
  }

  const carregarContasFixas = async () => {
    try {
      const response = await fetch(`${API_URL}/contas-fixas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setContasFixas(data)
      }
    } catch (error) {
      console.error('Erro ao carregar contas fixas:', error)
    }
  }

  const adicionarGasto = async (novoGasto: Omit<Gasto, "id">) => {
    try {
      const response = await fetch(`${API_URL}/gastos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(novoGasto)
      })
      if (response.ok) {
        await carregarGastos()
      }
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error)
    }
  }

  const adicionarContaFixa = async (novaContaFixa: Omit<ContaFixa, "id">) => {
    try {
      const response = await fetch(`${API_URL}/contas-fixas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(novaContaFixa)
      })
      if (response.ok) {
        await carregarContasFixas()
      }
    } catch (error) {
      console.error('Erro ao adicionar conta fixa:', error)
    }
  }

  const removerGasto = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/gastos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        await carregarGastos()
      }
    } catch (error) {
      console.error('Erro ao remover gasto:', error)
    }
  }

  const removerContaFixa = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/contas-fixas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        await carregarContasFixas()
      }
    } catch (error) {
      console.error('Erro ao remover conta fixa:', error)
    }
  }

  const atualizarStatusGasto = async (id: string, status: StatusPagamento) => {
    try {
      const response = await fetch(`${API_URL}/gastos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        await carregarGastos()
      }
    } catch (error) {
      console.error('Erro ao atualizar status do gasto:', error)
    }
  }

  const atualizarStatusContaFixa = async (id: string, status: StatusPagamento) => {
    try {
      const response = await fetch(`${API_URL}/contas-fixas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        await carregarContasFixas()
      }
    } catch (error) {
      console.error('Erro ao atualizar status da conta fixa:', error)
    }
  }

  const atualizarStatusParcela = async (id: string, status: StatusPagamento) => {
    try {
      const response = await fetch(`${API_URL}/parcelas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })
      if (response.ok) {
        await carregarParcelas()
      }
    } catch (error) {
      console.error('Erro ao atualizar status da parcela:', error)
    }
  }

  // Se não estiver logado, mostrar tela de login
  if (!usuario) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {modoLogin ? "Entrar" : "Criar Conta"}
            </CardTitle>
            <CardDescription>
              {modoLogin 
                ? "Entre com sua conta para acessar o sistema" 
                : "Crie uma nova conta para começar"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {erroAuth && (
                <Alert variant="destructive">
                  <AlertDescription>{erroAuth}</AlertDescription>
                </Alert>
              )}

              {!modoLogin && (
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={cadastroForm.nome}
                    onChange={(e) => setCadastroForm({...cadastroForm, nome: e.target.value})}
                    placeholder="Seu nome"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={modoLogin ? loginForm.email : cadastroForm.email}
                  onChange={(e) => {
                    if (modoLogin) {
                      setLoginForm({...loginForm, email: e.target.value})
                    } else {
                      setCadastroForm({...cadastroForm, email: e.target.value})
                    }
                  }}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={modoLogin ? loginForm.senha : cadastroForm.senha}
                  onChange={(e) => {
                    if (modoLogin) {
                      setLoginForm({...loginForm, senha: e.target.value})
                    } else {
                      setCadastroForm({...cadastroForm, senha: e.target.value})
                    }
                  }}
                  placeholder="Sua senha"
                />
              </div>

              <Button 
                onClick={modoLogin ? realizarLogin : realizarCadastro}
                disabled={carregandoAuth}
                className="w-full"
              >
                {carregandoAuth ? "Carregando..." : (modoLogin ? "Entrar" : "Criar Conta")}
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setModoLogin(!modoLogin)
                  setErroAuth("")
                }}
                className="w-full"
              >
                {modoLogin ? "Criar nova conta" : "Já tenho uma conta"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Interface principal para usuários logados
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Sistema Financeiro
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Bem-vindo, {usuario.nome}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {senhaDefinida && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleOcultarValores}
                className="flex items-center gap-2"
              >
                {ocultarValores ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {ocultarValores ? "Mostrar" : "Ocultar"} Valores
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Sumário */}
        <SumarioDashboard 
          gastos={gastos} 
          contasFixas={contasFixas} 
          ocultarValores={ocultarValores} 
        />

        {/* Tabs principais */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="gastos">Gastos</TabsTrigger>
            <TabsTrigger value="contas-fixas">Contas Fixas</TabsTrigger>
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="atrasados">Atrasados</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <SumarioDashboard 
              gastos={gastos} 
              contasFixas={contasFixas} 
              ocultarValores={ocultarValores} 
            />
          </TabsContent>

          <TabsContent value="gastos">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <FormularioAdicionarGasto aoAdicionarGasto={adicionarGasto} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <ListaGastos
                    gastos={gastos}
                    hideValues={ocultarValores}
                    onRemoveGasto={removerGasto}
                    onUpdateStatus={atualizarStatusGasto}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contas-fixas">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <FormularioAdicionarContaFixa aoAdicionarContaFixa={adicionarContaFixa} />
                </CardContent>
              </Card>
              <Card>
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

          <TabsContent value="graficos">
            <GraficosGastos gastos={gastos} ocultarValores={ocultarValores} />
          </TabsContent>

          <TabsContent value="atrasados">
            <ListaAtrasados 
              gastos={gastos} 
              contasFixas={contasFixas} 
              ocultarValores={ocultarValores}
              aoAtualizarStatusGasto={atualizarStatusGasto}
              aoAtualizarStatusContaFixa={atualizarStatusContaFixa}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal para definir senha */}
      <ModalSenha
        aberto={modalDefinirSenhaAberto}
        aoFechar={() => {
          if (!senhaDefinida) {
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
        aoConfirmar={verificarSenha}
        titulo="Verificar Senha"
        mensagem={`${ocultarValores ? 'Mostrar' : 'Ocultar'} valores financeiros.`}
        modoDefinicao={false}
        erro={erroSenha}
      />
    </div>
  )
}