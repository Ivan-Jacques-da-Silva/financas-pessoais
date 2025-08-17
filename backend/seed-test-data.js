
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de dados de teste...');

  try {
    // Verificar conexão
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');

    // Criar usuário de teste
    const testEmail = 'teste@financeiro.com';
    const testPassword = 'teste123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);

    let usuario = await prisma.usuario.findUnique({
      where: { email: testEmail }
    });

    if (usuario) {
      console.log('⚠️ Usuário de teste já existe! Limpando dados antigos...');
      await prisma.gasto.deleteMany({ where: { usuarioId: usuario.id } });
      await prisma.contaFixa.deleteMany({ where: { usuarioId: usuario.id } });
    } else {
      usuario = await prisma.usuario.create({
        data: {
          nome: "Usuário Teste",
          email: testEmail,
          senha: hashedPassword
        }
      });
    }

    console.log('✅ Usuário de teste configurado:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Senha: ${testPassword}`);
    console.log(`   ID: ${usuario.id}`);

    // Gerar dados para os últimos 4 meses
    const hoje = new Date();
    const meses = [];

    for (let i = 3; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      meses.push({
        mes: data.getMonth(),
        ano: data.getFullYear(),
        nome: data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      });
    }

    console.log('📅 Criando dados para os meses:', meses.map(m => m.nome).join(', '));

    // Contas Fixas - criar para cada mês
    const contasFixasTemplate = [
      { nome: 'Energia Elétrica', valor: 150.00, dia: 10 },
      { nome: 'Internet Fibra', valor: 89.90, dia: 5 },
      { nome: 'Aluguel', valor: 1200.00, dia: 1 },
      { nome: 'Água e Esgoto', valor: 75.50, dia: 15 },
      { nome: 'Gás', valor: 45.00, dia: 20 },
      { nome: 'Plano de Saúde', valor: 320.00, dia: 8 },
      { nome: 'Academia', valor: 89.90, dia: 12 },
      { nome: 'Netflix', valor: 29.90, dia: 25 },
      { nome: 'Spotify', valor: 16.90, dia: 3 },
      { nome: 'Seguro Auto', valor: 180.00, dia: 18 }
    ];

    const contasFixasData = [];
    meses.forEach(mes => {
      contasFixasTemplate.forEach(conta => {
        const dataVencimento = new Date(mes.ano, mes.mes, conta.dia);
        const hoje = new Date();
        
        let status = 'A_PAGAR';
        if (dataVencimento < hoje) {
          // 80% chance de estar pago se já venceu
          status = Math.random() < 0.8 ? 'PAGO' : 'ATRASADO';
        }

        contasFixasData.push({
          nome: conta.nome,
          valor: conta.valor,
          dataVencimento: dataVencimento,
          status: status,
          usuarioId: usuario.id
        });
      });
    });

    await prisma.contaFixa.createMany({ data: contasFixasData });
    console.log(`✅ Criadas ${contasFixasData.length} contas fixas`);

    // Gastos Variáveis - criar para cada mês
    const gastosTemplate = [
      { descricao: 'Supermercado Extra', valor: 280.50, tipo: 'DEBITO' },
      { descricao: 'Combustível', valor: 150.00, tipo: 'PIX' },
      { descricao: 'Farmácia', valor: 45.80, tipo: 'CARTAO_CREDITO' },
      { descricao: 'Restaurante', valor: 89.90, tipo: 'CARTAO_CREDITO' },
      { descricao: 'Uber', valor: 35.00, tipo: 'PIX' },
      { descricao: 'Compra Online Amazon', valor: 199.99, tipo: 'CARTAO_CREDITO' },
      { descricao: 'Padaria', valor: 25.50, tipo: 'DEBITO' },
      { descricao: 'Cinema', valor: 60.00, tipo: 'CARTAO_CREDITO' },
      { descricao: 'Conta Telefone', valor: 89.90, tipo: 'BOLETO' },
      { descricao: 'Material Escritório', valor: 120.00, tipo: 'PIX' },
      { descricao: 'Loja Roupas', valor: 250.00, tipo: 'CARTAO_CREDITO' },
      { descricao: 'Manutenção Carro', valor: 180.00, tipo: 'DEBITO' },
      { descricao: 'Livros', valor: 85.90, tipo: 'CARTAO_CREDITO' },
      { descricao: 'Delivery iFood', valor: 42.90, tipo: 'PIX' },
      { descricao: 'Pet Shop', valor: 95.00, tipo: 'DEBITO' }
    ];

    const gastosData = [];
    meses.forEach(mes => {
      // Entre 8 a 12 gastos por mês
      const numGastos = Math.floor(Math.random() * 5) + 8;
      
      for (let i = 0; i < numGastos; i++) {
        const gastoTemplate = gastosTemplate[Math.floor(Math.random() * gastosTemplate.length)];
        const diaAleatorio = Math.floor(Math.random() * 28) + 1;
        const dataVencimento = new Date(mes.ano, mes.mes, diaAleatorio);
        const hoje = new Date();
        
        // Variar o valor um pouco
        const valorVariado = gastoTemplate.valor * (0.8 + Math.random() * 0.4);
        
        let status = 'A_PAGAR';
        if (dataVencimento < hoje) {
          // 85% chance de estar pago se já venceu
          status = Math.random() < 0.85 ? 'PAGO' : 'ATRASADO';
        }

        gastosData.push({
          descricao: gastoTemplate.descricao,
          valor: Number(valorVariado.toFixed(2)),
          dataVencimento: dataVencimento,
          tipo: gastoTemplate.tipo,
          status: status,
          parcelas: 1,
          usuarioId: usuario.id
        });
      }
    });

    await prisma.gasto.createMany({ data: gastosData });
    console.log(`✅ Criados ${gastosData.length} gastos variáveis`);

    // Criar alguns gastos parcelados
    const gastosParceladosData = [];
    const parcelasData = [];

    meses.slice(0, 2).forEach((mes, mesIndex) => {
      const gastosParcelados = [
        { descricao: 'Smartphone novo', valor: 1200.00, parcelas: 6, tipo: 'CARTAO_CREDITO' },
        { descricao: 'Móveis casa', valor: 800.00, parcelas: 4, tipo: 'CARTAO_CREDITO' },
        { descricao: 'Notebook', valor: 2400.00, parcelas: 12, tipo: 'CARTAO_CREDITO' }
      ];

      gastosParcelados.forEach((gasto, index) => {
        const diaVencimento = 15 + (index * 2);
        const dataVencimento = new Date(mes.ano, mes.mes, diaVencimento);
        
        const gastoParcelado = {
          id: `gasto_parcelado_${mesIndex}_${index}`,
          descricao: gasto.descricao,
          valor: gasto.valor,
          dataVencimento: dataVencimento,
          tipo: gasto.tipo,
          parcelas: gasto.parcelas,
          status: 'A_PAGAR',
          usuarioId: usuario.id
        };

        gastosParceladosData.push(gastoParcelado);

        // Criar parcelas
        const valorParcela = gasto.valor / gasto.parcelas;
        for (let p = 1; p <= gasto.parcelas; p++) {
          const dataParcela = new Date(dataVencimento);
          dataParcela.setMonth(dataParcela.getMonth() + (p - 1));
          const hoje = new Date();

          let statusParcela = 'A_PAGAR';
          if (dataParcela < hoje) {
            statusParcela = Math.random() < 0.9 ? 'PAGO' : 'ATRASADO';
          }

          parcelasData.push({
            descricao: `${gasto.descricao} - Parcela ${p}/${gasto.parcelas}`,
            valor: Number(valorParcela.toFixed(2)),
            dataVencimento: dataParcela,
            numeroParcela: p,
            totalParcelas: gasto.parcelas,
            status: statusParcela,
            idGastoPrincipal: gastoParcelado.id
          });
        }
      });
    });

    // Inserir gastos parcelados primeiro
    for (const gasto of gastosParceladosData) {
      await prisma.gasto.create({ data: gasto });
    }
    console.log(`✅ Criados ${gastosParceladosData.length} gastos parcelados`);

    // Depois inserir as parcelas
    await prisma.parcela.createMany({ data: parcelasData });
    console.log(`✅ Criadas ${parcelasData.length} parcelas`);

    // Resumo final
    const totalContas = await prisma.contaFixa.count({ where: { usuarioId: usuario.id } });
    const totalGastos = await prisma.gasto.count({ where: { usuarioId: usuario.id } });
    const totalParcelas = await prisma.parcela.count();

    console.log('\n📊 RESUMO DOS DADOS CRIADOS:');
    console.log(`   👤 Usuário: ${usuario.nome} (${usuario.email})`);
    console.log(`   🏠 Contas Fixas: ${totalContas}`);
    console.log(`   💰 Gastos: ${totalGastos}`);
    console.log(`   📋 Parcelas: ${totalParcelas}`);
    console.log(`   📅 Período: ${meses[0].nome} até ${meses[meses.length - 1].nome}`);
    
    console.log('\n✅ Seed de dados de teste concluído com sucesso!');

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
