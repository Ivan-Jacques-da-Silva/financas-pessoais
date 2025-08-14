import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gestão Financeira Pessoal',
  description: 'Controle seus gastos, metas e finanças com facilidade.',
  generator: 'v0.dev',
  keywords: ['finanças', 'gastos', 'controle financeiro', 'pessoal', 'organização'],
  authors: [{ name: 'Seu Nome ou Empresa' }],
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
