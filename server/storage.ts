import { 
  clients, 
  investments, 
  performanceHistory, 
  type Client, 
  type InsertClient, 
  type Investment, 
  type InsertInvestment,
  type PerformanceHistory,
  type InsertPerformanceHistory
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Investment operations
  getInvestmentsByClient(clientId: number): Promise<Investment[]>;
  getInvestment(id: number): Promise<Investment | undefined>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: number, investment: Partial<InsertInvestment>): Promise<Investment | undefined>;
  deleteInvestment(id: number): Promise<boolean>;
  
  // Performance history operations
  getPerformanceHistory(clientId: number): Promise<PerformanceHistory[]>;
  createPerformanceRecord(record: InsertPerformanceHistory): Promise<PerformanceHistory>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private clients: Map<number, Client>;
  private investments: Map<number, Investment>;
  private performanceHistory: Map<number, PerformanceHistory>;
  private clientIdCounter: number;
  private investmentIdCounter: number;
  private performanceIdCounter: number;

  constructor() {
    this.clients = new Map();
    this.investments = new Map();
    this.performanceHistory = new Map();
    this.clientIdCounter = 1;
    this.investmentIdCounter = 1;
    this.performanceIdCounter = 1;
    
    // Add some sample data
    this.createInitialData();
  }

  // Client operations
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientIdCounter++;
    const now = new Date();
    const newClient: Client = {
      ...client,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    const updatedClient: Client = {
      ...client,
      ...updates,
      id,
      updatedAt: new Date(),
    };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    // Delete all client investments first
    const clientInvestments = await this.getInvestmentsByClient(id);
    for (const investment of clientInvestments) {
      await this.deleteInvestment(investment.id);
    }
    
    // Delete performance history
    const performanceRecords = Array.from(this.performanceHistory.values())
      .filter(record => record.clientId === id);
    for (const record of performanceRecords) {
      this.performanceHistory.delete(record.id);
    }
    
    return this.clients.delete(id);
  }

  // Investment operations
  async getInvestmentsByClient(clientId: number): Promise<Investment[]> {
    return Array.from(this.investments.values())
      .filter(investment => investment.clientId === clientId);
  }

  async getInvestment(id: number): Promise<Investment | undefined> {
    return this.investments.get(id);
  }

  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const id = this.investmentIdCounter++;
    const now = new Date();
    const newInvestment: Investment = {
      ...investment,
      id,
      performance: 0,
      previousValue: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.investments.set(id, newInvestment);
    return newInvestment;
  }

  async updateInvestment(id: number, updates: Partial<InsertInvestment>): Promise<Investment | undefined> {
    const investment = this.investments.get(id);
    if (!investment) return undefined;

    // Calculate previous value before update
    const previousValue = investment.quantity * investment.unitPrice;
    
    // Update the investment
    const updatedInvestment: Investment = {
      ...investment,
      ...updates,
      previousValue,
      updatedAt: new Date(),
    };
    
    // Calculate new performance if price changed
    if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
      const newValue = updatedInvestment.quantity * updatedInvestment.unitPrice;
      // Only calculate performance if previous value exists and is not zero
      if (previousValue > 0) {
        updatedInvestment.performance = ((newValue - previousValue) / previousValue) * 100;
      }
    }
    
    this.investments.set(id, updatedInvestment);
    return updatedInvestment;
  }

  async deleteInvestment(id: number): Promise<boolean> {
    return this.investments.delete(id);
  }

  // Performance history operations
  async getPerformanceHistory(clientId: number): Promise<PerformanceHistory[]> {
    return Array.from(this.performanceHistory.values())
      .filter(record => record.clientId === clientId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async createPerformanceRecord(record: InsertPerformanceHistory): Promise<PerformanceHistory> {
    const id = this.performanceIdCounter++;
    const newRecord: PerformanceHistory = {
      ...record,
      id,
    };
    this.performanceHistory.set(id, newRecord);
    return newRecord;
  }

  // Helper function to create initial demo data
  private async createInitialData() {
    // Create sample clients
    const client1 = await this.createClient({
      name: "Pedro Sousa",
      documentId: "123.456.789-00",
      documentType: "CPF",
      notes: "Cliente VIP desde 2020"
    });

    const client2 = await this.createClient({
      name: "Empresa ABC Ltda",
      documentId: "12.345.678/0001-90",
      documentType: "CNPJ",
      notes: "Empresa de tecnologia"
    });

    const client3 = await this.createClient({
      name: "Ana Silva",
      documentId: "987.654.321-00",
      documentType: "CPF",
      notes: "Investidora conservadora"
    });

    // Create sample investments for first client
    await this.createInvestment({
      clientId: client1.id,
      name: "PETR4",
      class: "Renda Variável",
      subclass: "Ações",
      quantity: 500,
      unitPrice: 32.75,
      autoUpdatePrice: true,
      ticker: "PETR4",
      notes: "Petrobras"
    });

    await this.createInvestment({
      clientId: client1.id,
      name: "Tesouro IPCA+ 2030",
      class: "Renda Fixa",
      subclass: "Títulos Públicos",
      quantity: 20,
      unitPrice: 2500,
      autoUpdatePrice: false,
      notes: "Título do governo indexado à inflação"
    });

    await this.createInvestment({
      clientId: client1.id,
      name: "Imóvel - Apartamento SP",
      class: "Imóveis",
      subclass: "Residencial",
      quantity: 1,
      unitPrice: 200000,
      autoUpdatePrice: false,
      notes: "Apartamento na zona sul de São Paulo"
    });

    await this.createInvestment({
      clientId: client1.id,
      name: "ITSA4",
      class: "Renda Variável",
      subclass: "Ações",
      quantity: 1500,
      unitPrice: 10.25,
      autoUpdatePrice: true,
      ticker: "ITSA4",
      notes: "Itausa"
    });

    await this.createInvestment({
      clientId: client1.id,
      name: "CDB Banco XYZ",
      class: "Renda Fixa",
      subclass: "CDBs",
      quantity: 1,
      unitPrice: 50000,
      autoUpdatePrice: false,
      notes: "Vencimento em 2025"
    });

    // Create sample performance history
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(date.getMonth() + i);
      
      const baseValue = 480000 + (i * 15000);
      const value = i === 5 ? 562750 : baseValue; // Last month has specific value

      await this.createPerformanceRecord({
        clientId: client1.id,
        date,
        totalValue: value,
        breakdown: {
          "Renda Variável": value * 0.383,
          "Renda Fixa": value * 0.262,
          "Imóveis": value * 0.355,
          "Fundos": 0,
        }
      });
    }
  }
}

export const storage = new MemStorage();
