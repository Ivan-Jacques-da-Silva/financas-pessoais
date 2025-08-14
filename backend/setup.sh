
#!/bin/bash

echo "🚀 Configurando ambiente do backend..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[SETUP]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se está no diretório backend
if [ ! -f "package.json" ]; then
    error "Execute este script dentro da pasta backend!"
    exit 1
fi

# 1. Instalar dependências
log "Instalando dependências do Node.js..."
npm install

if [ $? -ne 0 ]; then
    error "Falha ao instalar dependências do Node.js"
    exit 1
fi

# 2. Verificar se PostgreSQL está disponível
log "Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    warning "PostgreSQL não encontrado. Instalando..."
    # No Replit, usar nix
    echo "Adicione 'postgresql' aos módulos no .replit para instalar PostgreSQL"
fi

# 3. Configurar banco de dados
log "Configurando banco de dados..."

# Criar banco se não existir
createdb financeiro_db 2>/dev/null || {
    warning "Banco financeiro_db já existe ou erro ao criar"
}

# 4. Gerar Prisma Client
log "Gerando Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    error "Falha ao gerar Prisma Client"
    exit 1
fi

# 5. Executar migrações
log "Executando migrações do banco..."
npx prisma db push

if [ $? -ne 0 ]; then
    error "Falha ao executar migrações"
    exit 1
fi

# 6. Criar usuário admin (opcional)
log "Configuração concluída!"
log "Para criar um usuário admin, execute: npm run seed"

echo
log "✅ Setup concluído com sucesso!"
log "Para iniciar o servidor: npm run dev"
log "Para acessar Prisma Studio: npm run prisma:studio"
echo
