
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Verificar conexão
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');

    // Criar usuário admin
    const adminEmail = 'admin@financeiro.com';
    const adminPassword = 'admin123';

    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Verificar se admin já existe
    let admin = await prisma.usuario.findUnique({
      where: { email: adminEmail }
    });

    if (admin) {
      console.log('⚠️ Usuário admin já existe! Atualizando senha...');
      admin = await prisma.usuario.update({
        where: { email: adminEmail },
        data: { senha: hashedPassword }
      });
    } else {
      // Criar admin
      admin = await prisma.usuario.create({
        data: {
          email: adminEmail,
          senha: hashedPassword
        }
      });
    }

    console.log('✅ Usuário admin configurado:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminPassword}`);
    console.log(`   ID: ${admin.id}`);

    // Limpar dados existentes do usuário
    await prisma.gasto.deleteMany({
      where: { usuarioId: admin.id }
    });
    await prisma.contaFixa.deleteMany({
      where: { usuarioId: admin.id }
    });
    console.log('🧹 Dados antigos removidos');

    // Criar dados de exemplo
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Gastos de exemplo
    await prisma.gasto.createMany({
      data: [
        {
          descricao: 'Compra no Supermercado',
          valor: 250.50,
          dataVencimento: new Date(now.getFullYear(), now.getMonth(), 15),
          tipo: 'DEBITO',
          usuarioId: admin.id
        },
        {
          descricao: 'Combustível',
          valor: 180.00,
          dataVencimento: new Date(now.getFullYear(), now.getMonth(), 20),
          tipo: 'PIX',
          usuarioId: admin.id
        },
        {
          descricao: 'Compra Online',
          valor: 450.00,
          dataVencimento: nextMonth,
          tipo: 'CARTAO_CREDITO',
          parcelas: 3,
          usuarioId: admin.id
        }
      ]
    });

    // Contas fixas de exemplo
    await prisma.contaFixa.createMany({
      data: [
        {
          nome: 'Energia Elétrica',
          valor: 120.00,
          dataVencimento: new Date(now.getFullYear(), now.getMonth(), 10),
          usuarioId: admin.id
        },
        {
          nome: 'Internet',
          valor: 89.90,
          dataVencimento: new Date(now.getFullYear(), now.getMonth(), 5),
          usuarioId: admin.id
        },
        {
          nome: 'Aluguel',
          valor: 850.00,
          dataVencimento: new Date(now.getFullYear(), now.getMonth(), 1),
          usuarioId: admin.id
        }
      ]
    });

    console.log('✅ Dados de exemplo criados!');
    
  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
