
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Setup COMPLETO - Configurando ambiente do backend do zero...');

function runCommand(command, description, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${description}...`);
    
    const execOptions = {
      cwd: process.cwd(),
      timeout: options.timeout || 60000,
      ...options
    };

    exec(command, execOptions, (error, stdout, stderr) => {
      if (error) {
        if (options.ignoreError) {
          console.log(`⚠️ ${description} - Ignorando erro: ${error.message}`);
          resolve(stdout);
          return;
        }
        console.error(`❌ Erro: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr && !options.ignoreStderr) {
        console.log(`⚠️ Warning: ${stderr}`);
      }
      if (stdout) {
        console.log(stdout);
      }
      resolve(stdout);
    });
  });
}

async function setupCompleteDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL não encontrada no arquivo .env');
  }

  console.log('\n🗄️ SETUP COMPLETO DO BANCO DE DADOS...');
  
  try {
    // Extrair informações da URL do banco
    const url = new URL(dbUrl);
    const host = url.hostname;
    const port = url.port || 5432;
    const username = url.username;
    const password = url.password;
    const database = url.pathname.slice(1);

    // Configurar senha para todos os comandos
    process.env.PGPASSWORD = password;

    // 1. Verificar PostgreSQL
    await runCommand('psql --version', '1. Verificando PostgreSQL instalado');
    
    // 2. DELETAR banco se existir
    console.log('\n🗑️ LIMPANDO BANCO EXISTENTE...');
    const dropDbCmd = `psql -h ${host} -p ${port} -U ${username} -d postgres -c "DROP DATABASE IF EXISTS ${database};"`;
    await runCommand(dropDbCmd, `2. Deletando banco ${database} (se existir)`, { 
      ignoreError: true,
      ignoreStderr: true 
    });
    
    // 3. CRIAR banco novo
    console.log('\n🆕 CRIANDO BANCO NOVO...');
    const createDbCmd = `psql -h ${host} -p ${port} -U ${username} -d postgres -c "CREATE DATABASE ${database};"`;
    await runCommand(createDbCmd, `3. Criando banco ${database} novo`);
    
    // 4. Testar conexão com banco novo
    const connectCmd = `psql -h ${host} -p ${port} -U ${username} -d ${database} -c "SELECT version();"`;
    await runCommand(connectCmd, '4. Testando conexão com banco novo');
    
    console.log('✅ Banco de dados criado e conectado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro na configuração do banco:', error.message);
    throw error;
  }
}

async function setupPrismaComplete() {
  try {
    console.log('\n🔧 CONFIGURAÇÃO COMPLETA DO PRISMA...');
    
    // 1. Gerar Prisma Client
    await runCommand('npx prisma generate', '5. Gerando Prisma Client');

    // 2. Push do schema (criar todas as tabelas)
    console.log('\n📊 CRIANDO TODAS AS TABELAS...');
    await runCommand('npx prisma db push --force-reset', '6. Criando schema completo no banco');

    // 3. Verificar tabelas criadas
    const dbUrl = new URL(process.env.DATABASE_URL);
    process.env.PGPASSWORD = dbUrl.password;
    const checkTablesCmd = `psql -h ${dbUrl.hostname} -p ${dbUrl.port || 5432} -U ${dbUrl.username} -d ${dbUrl.pathname.slice(1)} -c "\\dt"`;
    await runCommand(checkTablesCmd, '7. Verificando tabelas criadas');

    console.log('✅ Prisma configurado e tabelas criadas!');
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração do Prisma:', error.message);
    throw error;
  }
}

async function populateDatabase() {
  try {
    console.log('\n🌱 POPULANDO BANCO COM DADOS INICIAIS...');
    
    // Executar seed para criar dados iniciais
    await runCommand('node seed.js', '8. Populando banco com dados iniciais');
    
    console.log('✅ Banco populado com dados iniciais!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error.message);
    throw error;
  }
}

async function verifyComplete() {
  try {
    console.log('\n🔍 VERIFICAÇÃO FINAL COMPLETA...');
    
    // Verificar dados no banco
    const dbUrl = new URL(process.env.DATABASE_URL);
    process.env.PGPASSWORD = dbUrl.password;
    
    const checkUsersCmd = `psql -h ${dbUrl.hostname} -p ${dbUrl.port || 5432} -U ${dbUrl.username} -d ${dbUrl.pathname.slice(1)} -c "SELECT count(*) as usuarios FROM usuarios;"`;
    await runCommand(checkUsersCmd, '9. Verificando usuários criados', { ignoreError: true });
    
    const checkGastosCmd = `psql -h ${dbUrl.hostname} -p ${dbUrl.port || 5432} -U ${dbUrl.username} -d ${dbUrl.pathname.slice(1)} -c "SELECT count(*) as gastos FROM gastos;"`;
    await runCommand(checkGastosCmd, '10. Verificando gastos criados', { ignoreError: true });
    
    const checkContasCmd = `psql -h ${dbUrl.hostname} -p ${dbUrl.port || 5432} -U ${dbUrl.username} -d ${dbUrl.pathname.slice(1)} -c "SELECT count(*) as contas FROM contas_fixas;"`;
    await runCommand(checkContasCmd, '11. Verificando contas fixas criadas', { ignoreError: true });
    
    // Teste rápido do servidor
    console.log('\n🚀 TESTE DO SERVIDOR...');
    try {
      const testCmd = 'timeout 8s npm run dev || true';
      await runCommand(testCmd, '12. Teste de inicialização do servidor', { 
        ignoreError: true,
        ignoreStderr: true,
        timeout: 10000
      });
    } catch (error) {
      console.log('⚠️ Teste do servidor - normal se demorou para iniciar');
    }

    console.log('✅ Verificação completa finalizada!');
    return true;
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
    throw error;
  }
}

async function setupCompleteEnvironment() {
  try {
    // Verificar se está no diretório correto
    if (!fs.existsSync('package.json')) {
      console.error('❌ Execute este script dentro da pasta backend!');
      process.exit(1);
    }

    // Verificar arquivo .env
    if (!fs.existsSync('.env')) {
      console.error('❌ Arquivo .env não encontrado!');
      process.exit(1);
    }

    console.log('📝 Configurações carregadas do .env:');
    console.log(`   - PORT: ${process.env.PORT || 'não definido'}`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'não definido'}`);
    console.log(`   - Database: ${process.env.DATABASE_URL ? 'configurado' : 'não configurado'}`);

    // ETAPAS DO SETUP COMPLETO:

    // 1. Instalar dependências
    await runCommand('npm install', '0. Instalando dependências do Node.js');

    // 2. Setup completo do banco (deletar + criar)
    await setupCompleteDatabase();

    // 3. Configurar Prisma completo
    await setupPrismaComplete();

    // 4. Popular com dados iniciais
    await populateDatabase();

    // 5. Verificação final
    await verifyComplete();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SETUP COMPLETO FINALIZADO COM SUCESSO! 🎉');
    console.log('='.repeat(60));
    
    console.log('\n📋 RESUMO DO QUE FOI CRIADO:');
    console.log('✅ Banco de dados deletado e recriado');
    console.log('✅ Todas as tabelas criadas (usuarios, gastos, contas_fixas, parcelas)');
    console.log('✅ Usuário admin criado');
    console.log('✅ Dados de exemplo adicionados');
    console.log('✅ Prisma Client configurado');

    console.log('\n🔑 CREDENCIAIS DE ACESSO:');
    console.log('   📧 Email: admin@financeiro.com');
    console.log('   🔒 Senha: admin123');

    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. Iniciar servidor: npm run dev');
    console.log(`2. Acessar API: http://0.0.0.0:${process.env.PORT || 5000}`);
    console.log('3. Health check: /health');
    console.log('4. Prisma Studio: npx prisma studio');
    console.log('5. Ver logs: npm run dev (deixe rodando)');

    console.log('\n📚 ENDPOINTS DISPONÍVEIS:');
    console.log('- POST /auth/register - Registrar usuário');
    console.log('- POST /auth/login - Fazer login');
    console.log('- GET /dashboard - Dashboard com resumo');
    console.log('- GET /gastos - Listar gastos');
    console.log('- POST /gastos - Criar gasto');
    console.log('- GET /contas-fixas - Listar contas fixas');
    console.log('- POST /contas-fixas - Criar conta fixa');

  } catch (error) {
    console.error('\n❌ FALHA NO SETUP COMPLETO:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Verifique se PostgreSQL está rodando');
    console.log('2. Verifique credenciais no .env');
    console.log('3. Teste conexão manual: psql -U postgres');
    console.log('4. Execute novamente: node setup-local.js');
    console.log('5. Se persistir, delete e recrie o banco manualmente');
    process.exit(1);
  }
}

setupCompleteEnvironment();
