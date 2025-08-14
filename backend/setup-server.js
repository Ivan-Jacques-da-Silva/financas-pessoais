
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando ambiente do backend para servidor...');

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erro: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.log(`⚠️ Warning: ${stderr}`);
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
}

async function setupEnvironment() {
  try {
    // Verificar se está no diretório correto
    if (!fs.existsSync('package.json')) {
      console.error('❌ Execute este script dentro da pasta backend!');
      process.exit(1);
    }

    // 1. Instalar dependências
    await runCommand('npm install', 'Instalando dependências do Node.js');

    // 2. Gerar Prisma Client
    await runCommand('npx prisma generate', 'Gerando Prisma Client');

    // 3. Executar migrações
    await runCommand('npx prisma db push', 'Executando migrações do banco');

    console.log('\n✅ Setup concluído com sucesso!');
    console.log('Para popular o banco: node seed.js');
    console.log('Para iniciar o servidor: npm run dev');
    console.log('Para build de produção: npm run build && npm start');

  } catch (error) {
    console.error('❌ Falha no setup:', error.message);
    process.exit(1);
  }
}

setupEnvironment();
