import { db } from "../server/db";
import { clients, investments, performanceHistory } from "../shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create sample clients
  console.log("Creating clients...");
  const [client1] = await db
    .insert(clients)
    .values({
      name: "Pedro Sousa",
      documentId: "123.456.789-00",
      documentType: "CPF",
      notes: "Cliente VIP desde 2020",
      emergencyReserveTarget: 30000,
      investmentPlan: {
        "Renda Variável": 30,
        "Renda Fixa": 40,
        "Imóveis": 20,
        "Fundos": 10,
      },
    })
    .returning();

  const [client2] = await db
    .insert(clients)
    .values({
      name: "Empresa ABC Ltda",
      documentId: "12.345.678/0001-90",
      documentType: "CNPJ",
      notes: "Empresa de tecnologia",
      emergencyReserveTarget: 100000,
      investmentPlan: {
        "Renda Variável": 20,
        "Renda Fixa": 30,
        "Imóveis": 40,
        "Fundos": 10,
      },
    })
    .returning();

  const [client3] = await db
    .insert(clients)
    .values({
      name: "Ana Silva",
      documentId: "987.654.321-00",
      documentType: "CPF",
      notes: "Investidora conservadora",
      emergencyReserveTarget: 50000,
      investmentPlan: {
        "Renda Variável": 15,
        "Renda Fixa": 60,
        "Imóveis": 15,
        "Fundos": 10,
      },
    })
    .returning();

  console.log(`Created ${[client1, client2, client3].length} clients`);

  // Create sample investments for first client
  console.log("Creating investments...");
  const investmentsData = [
    {
      clientId: client1.id,
      name: "PETR4",
      type: "investment",
      class: "Renda Variável",
      subclass: "Ações",
      quantity: 500,
      unitPrice: 32.75,
      autoUpdatePrice: true,
      ticker: "PETR4",
      notes: "Petrobras"
    },
    {
      clientId: client1.id,
      name: "Tesouro IPCA+ 2030",
      type: "investment",
      class: "Renda Fixa",
      subclass: "Títulos Públicos",
      quantity: 20,
      unitPrice: 2500,
      autoUpdatePrice: false,
      notes: "Título do governo indexado à inflação"
    },
    {
      clientId: client1.id,
      name: "Imóvel - Apartamento SP",
      type: "investment",
      class: "Imóveis",
      subclass: "Residencial",
      quantity: 1,
      unitPrice: 200000,
      autoUpdatePrice: false,
      notes: "Apartamento na zona sul de São Paulo"
    },
    {
      clientId: client1.id,
      name: "ITSA4",
      type: "investment",
      class: "Renda Variável",
      subclass: "Ações",
      quantity: 1500,
      unitPrice: 10.25,
      autoUpdatePrice: true,
      ticker: "ITSA4",
      notes: "Itausa"
    },
    {
      clientId: client1.id,
      name: "CDB Banco XYZ",
      type: "emergency",
      class: "Renda Fixa",
      subclass: "CDBs",
      quantity: 1,
      unitPrice: 30000,
      autoUpdatePrice: false,
      notes: "Reserva de emergência"
    }
  ];

  const createdInvestments = await db.insert(investments).values(investmentsData).returning();
  console.log(`Created ${createdInvestments.length} investments`);

  // Create sample performance history
  console.log("Creating performance history...");
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  for (let i = 0; i < 6; i++) {
    const date = new Date(sixMonthsAgo);
    date.setMonth(date.getMonth() + i);
    
    const baseValue = 480000 + (i * 15000);
    const value = i === 5 ? 562750 : baseValue; // Last month has specific value

    const breakdown = {
      "Renda Variável": value * 0.383,
      "Renda Fixa": value * 0.262,
      "Imóveis": value * 0.355,
      "Fundos": 0,
    };

    // Take a snapshot of investments (simplified for example)
    const investmentsSnapshot = createdInvestments.map(inv => ({ 
      ...inv, 
      unitPrice: inv.unitPrice * (1 + (i * 0.02)) // Simple 2% increase per month
    }));

    await db.insert(performanceHistory).values({
      clientId: client1.id,
      date,
      name: `Checkpoint ${date.toLocaleDateString()}`,
      description: `Checkpoint automático para ${date.toLocaleDateString()}`,
      totalValue: value,
      breakdown,
      investmentsSnapshot
    });
  }

  console.log("🌱 Seeding completed!");
}

seed()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.end();
    process.exit(0);
  });